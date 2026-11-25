import re
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator


def _check_strength(v: str) -> str:
    if not (re.search(r"[a-z]", v) and re.search(r"[A-Z]", v) and re.search(r"\d", v)):
        raise ValueError("Password must contain upper-case, lower-case and a digit")
    return v


class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=150)
    email: EmailStr
    username: str = Field(min_length=3, max_length=50, pattern=r"^[A-Za-z0-9_.-]+$")
    password: str = Field(min_length=8, max_length=128)
    confirm_password: str

    _strength = field_validator("password")(_check_strength)

    @model_validator(mode="after")
    def _match(self):
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self


class LoginRequest(BaseModel):
    identifier: str = Field(min_length=3, max_length=255)  # email or username
    password: str = Field(min_length=1, max_length=128)
    remember_me: bool = False


class RefreshRequest(BaseModel):
    refresh_token: str | None = None  # mobile sends it in the body; web uses the cookie


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)
    _strength = field_validator("new_password")(_check_strength)


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: str
    username: str
    full_name: str
    roles: list[str] = []

    @field_validator("roles", mode="before")
    @classmethod
    def _role_names(cls, v):
        return [r.name if hasattr(r, "name") else r for r in v]


class AuthResult(BaseModel):
    user: UserOut
    access_token: str | None = None   # populated for mobile clients only
    refresh_token: str | None = None  # populated for mobile clients only
    token_type: str = "bearer"


class MessageOut(BaseModel):
    message: str


class AvailabilityOut(BaseModel):
    available: bool
