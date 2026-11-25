"""API tests for the authentication feature (SQLite, in-memory)."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database.base import Base
from app.database.session import get_db
from app.features.authentication.dependencies import require_admin
from app.main import app
from app import models  # noqa: F401

PW = "Str0ngPass1"
REG = {"full_name": "Test User", "email": "t@example.com", "username": "tester",
       "password": PW, "confirm_password": PW}


@pytest.fixture()
def client():
    engine = create_engine("sqlite://", poolclass=StaticPool, connect_args={"check_same_thread": False})
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine, expire_on_commit=False)

    def override():
        db = Session()
        try:
            yield db; db.commit()
        except Exception:
            db.rollback(); raise
        finally:
            db.close()

    app.dependency_overrides[get_db] = override
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def test_register_and_duplicates(client):
    r = client.post("/api/v1/auth/register", json=REG)
    assert r.status_code == 201 and r.json()["roles"] == ["User"] and "password" not in r.text
    assert client.post("/api/v1/auth/register", json=REG).status_code == 409
    assert client.post("/api/v1/auth/register", json={**REG, "email": "o@example.com"}).status_code == 409


def test_weak_and_mismatched_password(client):
    assert client.post("/api/v1/auth/register", json={**REG, "password": "weakpass", "confirm_password": "weakpass"}).status_code == 422
    assert client.post("/api/v1/auth/register", json={**REG, "confirm_password": "Different1"}).status_code == 422


def test_login_sets_httponly_cookies_and_me(client):
    client.post("/api/v1/auth/register", json=REG)
    r = client.post("/api/v1/auth/login", json={"identifier": "tester", "password": PW})
    assert r.status_code == 200 and r.json()["access_token"] is None
    assert "httponly" in r.headers["set-cookie"].lower()
    assert client.get("/api/v1/auth/me").json()["username"] == "tester"


def test_login_wrong_password(client):
    client.post("/api/v1/auth/register", json=REG)
    assert client.post("/api/v1/auth/login", json={"identifier": "tester", "password": "nope"}).status_code == 401
    assert client.post("/api/v1/auth/login", json={"identifier": "ghost", "password": PW}).status_code == 401


def test_me_requires_auth(client):
    assert client.get("/api/v1/auth/me").status_code == 401


def test_mobile_login_and_refresh_rotation_with_reuse_detection(client):
    client.post("/api/v1/auth/register", json=REG)
    h = {"X-Client": "mobile"}
    r = client.post("/api/v1/auth/login", json={"identifier": "t@example.com", "password": PW}, headers=h)
    body = r.json(); old = body["refresh_token"]
    assert body["access_token"] and old
    client.cookies.clear()

    r2 = client.post("/api/v1/auth/refresh", json={"refresh_token": old}, headers=h)
    assert r2.status_code == 200
    new = r2.json()["refresh_token"]; assert new != old

    # replaying the OLD token revokes the whole family, so the NEW one stops working too
    assert client.post("/api/v1/auth/refresh", json={"refresh_token": old}, headers=h).status_code == 401
    assert client.post("/api/v1/auth/refresh", json={"refresh_token": new}, headers=h).status_code == 401


def test_logout_revokes_refresh(client):
    client.post("/api/v1/auth/register", json=REG)
    h = {"X-Client": "mobile"}
    tok = client.post("/api/v1/auth/login", json={"identifier": "tester", "password": PW}, headers=h).json()["refresh_token"]
    client.cookies.clear()
    assert client.post("/api/v1/auth/logout", json={"refresh_token": tok}, headers=h).status_code == 200
    assert client.post("/api/v1/auth/refresh", json={"refresh_token": tok}, headers=h).status_code == 401


def test_availability_checks(client):
    client.post("/api/v1/auth/register", json=REG)
    assert client.get("/api/v1/auth/check-username", params={"username": "tester"}).json() == {"available": False}
    assert client.get("/api/v1/auth/check-email", params={"email": "free@example.com"}).json() == {"available": True}


def test_admin_dependency_blocks_normal_user(client):
    from fastapi import Depends

    @app.get("/api/v1/_admin_probe")
    def probe(_=Depends(require_admin)):
        return {"ok": True}

    client.post("/api/v1/auth/register", json=REG)
    client.post("/api/v1/auth/login", json={"identifier": "tester", "password": PW})
    assert client.get("/api/v1/_admin_probe").status_code == 403
