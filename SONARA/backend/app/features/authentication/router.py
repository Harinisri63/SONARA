"""HTTP layer only: parse request, call AuthService, shape response. Web: cookies. Mobile (X-Client: mobile): body tokens."""
from fastapi import APIRouter, Depends, Request, Response, status
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.database.session import get_db
from app.features.authentication.dependencies import ACCESS_COOKIE, REFRESH_COOKIE, get_current_user
from app.features.authentication.repository import AuthRepository
from app.features.authentication.schemas import (AuthResult, AvailabilityOut, ForgotPasswordRequest,
                                                  LoginRequest, MessageOut, RefreshRequest,
                                                  RegisterRequest, ResetPasswordRequest, UserOut)
from app.features.authentication.service import AuthService, TokenPair
from app.models import User

router = APIRouter(prefix="/auth", tags=["authentication"])


def _is_mobile(request: Request) -> bool:
    return request.headers.get("X-Client", "web").lower() == "mobile"


def _respond(request: Request, response: Response, user: User, pair: TokenPair) -> AuthResult:
    secure = get_settings().app_env != "development"
    s = get_settings()
    response.set_cookie(ACCESS_COOKIE, pair.access_token, max_age=s.access_token_minutes * 60,
                        httponly=True, secure=secure, samesite="lax", path="/")
    response.set_cookie(REFRESH_COOKIE, pair.refresh_token, max_age=pair.refresh_max_age,
                        httponly=True, secure=secure, samesite="lax", path="/api/v1/auth")
    return AuthResult(user=UserOut.model_validate(user), access_token=pair.access_token,
                      refresh_token=pair.refresh_token)


def _client(request: Request) -> str:
    return "mobile" if _is_mobile(request) else "web"


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    return AuthService(db).register(body)


@router.post("/login", response_model=AuthResult)
def login(body: LoginRequest, request: Request, response: Response, db: Session = Depends(get_db)):
    user, pair = AuthService(db).login(body.identifier, body.password, _client(request), body.remember_me)
    return _respond(request, response, user, pair)


@router.post("/refresh", response_model=AuthResult)
def refresh(request: Request, response: Response, body: RefreshRequest | None = None,
            db: Session = Depends(get_db)):
    raw = (body.refresh_token if body and body.refresh_token else None) or request.cookies.get(REFRESH_COOKIE)
    user, pair = AuthService(db).refresh(raw, _client(request))
    return _respond(request, response, user, pair)


@router.post("/logout", response_model=MessageOut)
def logout(request: Request, response: Response, body: RefreshRequest | None = None,
           db: Session = Depends(get_db)):
    raw = (body.refresh_token if body and body.refresh_token else None) or request.cookies.get(REFRESH_COOKIE)
    AuthService(db).logout(raw)
    response.delete_cookie(ACCESS_COOKIE, path="/")
    response.delete_cookie(REFRESH_COOKIE, path="/api/v1/auth")
    return MessageOut(message="Logged out")


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user


@router.post("/forgot-password", response_model=MessageOut)
def forgot_password(body: ForgotPasswordRequest, db: Session = Depends(get_db)):
    AuthService(db).forgot_password(body.email)
    return MessageOut(message="If that email exists, a reset link has been sent")


@router.post("/reset-password", response_model=MessageOut)
def reset_password(body: ResetPasswordRequest, db: Session = Depends(get_db)):
    AuthService(db).reset_password(body.token, body.new_password)
    return MessageOut(message="Password updated")


@router.get("/check-username", response_model=AvailabilityOut)
def check_username(username: str, db: Session = Depends(get_db)):
    return AvailabilityOut(available=not AuthRepository(db).username_exists(username))


@router.get("/check-email", response_model=AvailabilityOut)
def check_email(email: str, db: Session = Depends(get_db)):
    return AvailabilityOut(available=not AuthRepository(db).email_exists(email))
