"""Authentication business rules: registration, login, refresh rotation with reuse detection, reset."""
import logging
import uuid
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import (create_access_token, hash_password, hash_refresh_token,
                               new_refresh_token, verify_password)
from app.features.authentication.repository import AuthRepository
from app.features.authentication.schemas import RegisterRequest
from app.models import User

log = logging.getLogger("sonara.auth")


def _now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)  # naive UTC, matches DATETIME columns


def _unauthorized(msg: str = "Invalid credentials") -> HTTPException:
    return HTTPException(status.HTTP_401_UNAUTHORIZED, msg)


@dataclass
class TokenPair:
    access_token: str
    refresh_token: str
    refresh_max_age: int  # seconds


class AuthService:
    def __init__(self, db: Session):
        self.repo = AuthRepository(db)
        self.settings = get_settings()

    def register(self, data: RegisterRequest) -> User:
        if self.repo.email_exists(data.email):
            raise HTTPException(status.HTTP_409_CONFLICT, "Email is already registered")
        if self.repo.username_exists(data.username):
            raise HTTPException(status.HTTP_409_CONFLICT, "Username is already taken")
        role = self.repo.get_or_create_role("User")
        return self.repo.create_user(email=data.email.lower(), username=data.username,
                                     full_name=data.full_name.strip(),
                                     password_hash=hash_password(data.password), role=role)

    def _issue(self, user: User, client_type: str, family_id: str | None = None,
               remember: bool = True) -> tuple[TokenPair, int]:
        days = self.settings.refresh_token_days if remember else 1
        raw, hashed = new_refresh_token()
        row = self.repo.add_refresh(user_id=user.id, token_hash=hashed, family_id=family_id or str(uuid.uuid4()),
                                    expires_at=_now() + timedelta(days=days), client_type=client_type)
        access = create_access_token(user.id, [r.name for r in user.roles])
        return TokenPair(access, raw, days * 86400), row.id

    def login(self, identifier: str, password: str, client_type: str, remember: bool) -> tuple[User, TokenPair]:
        user = self.repo.get_by_identifier(identifier)
        # same error for unknown user / wrong password / inactive: no account enumeration
        if user is None or not user.is_active or not verify_password(password, user.password_hash):
            raise _unauthorized()
        pair, _ = self._issue(user, client_type, remember=remember)
        return user, pair

    def refresh(self, raw_token: str | None, client_type: str) -> tuple[User, TokenPair]:
        if not raw_token:
            raise _unauthorized("Missing refresh token")
        row = self.repo.get_refresh(hash_refresh_token(raw_token))
        if row is None:
            raise _unauthorized("Invalid refresh token")
        now = _now()
        if row.revoked_at is not None:
            # a rotated/revoked token was presented again: assume theft, kill the whole family
            log.warning("Refresh token reuse detected for user %s", row.user_id)
            self.repo.revoke_family(row.family_id, now)
            self.repo.db.commit()  # persist the revocation even though the request fails
            raise _unauthorized("Refresh token revoked")
        if row.expires_at <= now:
            raise _unauthorized("Refresh token expired")
        user = self.repo.get_by_id(row.user_id)
        if user is None or not user.is_active:
            raise _unauthorized()
        pair, new_id = self._issue(user, client_type, family_id=row.family_id)
        row.revoked_at = now
        row.replaced_by_id = new_id
        return user, pair

    def logout(self, raw_token: str | None) -> None:
        if not raw_token:
            return
        row = self.repo.get_refresh(hash_refresh_token(raw_token))
        if row is not None:
            self.repo.revoke_family(row.family_id, _now())

    def forgot_password(self, email: str) -> None:
        """Always succeeds from the caller's view (no account enumeration)."""
        user = self.repo.get_by_email(email)
        if user is None:
            return
        raw, hashed = new_refresh_token()
        self.repo.add_reset(user.id, hashed, _now() + timedelta(minutes=30))
        if self.settings.app_env == "development":
            log.info("DEV ONLY password reset token for %s: %s", email, raw)
        # TODO(Phase 4b): send via email provider; never log tokens outside development.

    def reset_password(self, raw_token: str, new_password: str) -> None:
        row = self.repo.get_reset(hash_refresh_token(raw_token))
        now = _now()
        if row is None or row.used_at is not None or row.expires_at <= now:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid or expired reset token")
        user = self.repo.get_by_id(row.user_id)
        if user is None:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid or expired reset token")
        self.repo.set_password(user, hash_password(new_password))
        row.used_at = now
        self.repo.revoke_all_for_user(user.id, now)  # sign out everywhere
