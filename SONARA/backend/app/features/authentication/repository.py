"""All database access for authentication. No business rules here."""
from datetime import datetime

from sqlalchemy import func, or_, select, update
from sqlalchemy.orm import Session

from app.models import PasswordResetToken, RefreshToken, Role, User, UserRole


class AuthRepository:
    def __init__(self, db: Session):
        self.db = db

    # users
    def get_by_id(self, user_id: int) -> User | None:
        return self.db.scalar(select(User).where(User.id == user_id, User.is_deleted == False))

    def get_by_email(self, email: str) -> User | None:
        return self.db.scalar(select(User).where(func.lower(User.email) == email.lower(), User.is_deleted == False))

    def email_exists(self, email: str) -> bool:
        return self.db.scalar(select(func.count()).select_from(User).where(func.lower(User.email) == email.lower())) > 0

    def username_exists(self, username: str) -> bool:
        return self.db.scalar(select(func.count()).select_from(User).where(func.lower(User.username) == username.lower())) > 0

    def get_by_identifier(self, identifier: str) -> User | None:
        ident = identifier.lower()
        return self.db.scalar(select(User).where(
            or_(func.lower(User.email) == ident, func.lower(User.username) == ident), User.is_deleted == False))

    def get_or_create_role(self, name: str) -> Role:
        role = self.db.scalar(select(Role).where(Role.name == name))
        if role is None:
            role = Role(name=name); self.db.add(role); self.db.flush()
        return role

    def create_user(self, *, email, username, full_name, password_hash, role: Role) -> User:
        user = User(email=email, username=username, full_name=full_name, password_hash=password_hash)
        self.db.add(user); self.db.flush()
        self.db.add(UserRole(user_id=user.id, role_id=role.id)); self.db.flush()
        self.db.refresh(user)
        return user

    def set_password(self, user: User, password_hash: str) -> None:
        user.password_hash = password_hash

    # refresh tokens
    def add_refresh(self, **kw) -> RefreshToken:
        tok = RefreshToken(**kw); self.db.add(tok); self.db.flush(); return tok

    def get_refresh(self, token_hash: str) -> RefreshToken | None:
        return self.db.scalar(select(RefreshToken).where(RefreshToken.token_hash == token_hash))

    def revoke_family(self, family_id: str, now: datetime) -> None:
        self.db.execute(update(RefreshToken)
                        .where(RefreshToken.family_id == family_id, RefreshToken.revoked_at.is_(None))
                        .values(revoked_at=now))

    def revoke_all_for_user(self, user_id: int, now: datetime) -> None:
        self.db.execute(update(RefreshToken)
                        .where(RefreshToken.user_id == user_id, RefreshToken.revoked_at.is_(None))
                        .values(revoked_at=now))

    # password reset
    def add_reset(self, user_id: int, token_hash: str, expires_at: datetime) -> None:
        self.db.add(PasswordResetToken(user_id=user_id, token_hash=token_hash, expires_at=expires_at))
        self.db.flush()

    def get_reset(self, token_hash: str) -> PasswordResetToken | None:
        return self.db.scalar(select(PasswordResetToken).where(PasswordResetToken.token_hash == token_hash))
