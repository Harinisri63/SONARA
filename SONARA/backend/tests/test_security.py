import jwt
import pytest

from app.core.security import (create_access_token, decode_access_token, hash_password,
                               hash_refresh_token, new_refresh_token, verify_password)


def test_password_roundtrip():
    h = hash_password("S3cure!pass")
    assert h != "S3cure!pass" and verify_password("S3cure!pass", h)
    assert not verify_password("wrong", h)


def test_access_token_roundtrip_and_tamper():
    tok = create_access_token(7, ["User"])
    assert decode_access_token(tok)["sub"] == "7"
    with pytest.raises(jwt.PyJWTError):
        decode_access_token(tok[:-2] + "xx")


def test_refresh_token_hash_matches():
    raw, h = new_refresh_token()
    assert hash_refresh_token(raw) == h and raw != h
