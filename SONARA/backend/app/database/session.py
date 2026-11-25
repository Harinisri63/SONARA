"""Engine with connection pooling, and the FastAPI session dependency."""
from collections.abc import Iterator
import urllib.parse
import re

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings

_engine = None
_SessionLocal = None


def normalize_db_url(url: str) -> str:
    """Ensure raw ODBC strings like 'Server=...;' are converted to valid SQLAlchemy mssql+pyodbc URLs."""
    if not url:
        return url
    trimmed = url.strip().strip('"').strip("'")
    if trimmed.startswith("sqlite") or trimmed.startswith("postgresql") or trimmed.startswith("mysql"):
        return trimmed
    if trimmed.startswith("mssql+pyodbc:///?odbc_connect="):
        return trimmed

    # If it's a raw ODBC string or MSSQL string
    odbc_str = trimmed
    if "DRIVER=" not in odbc_str.upper():
        odbc_str = "DRIVER={ODBC Driver 18 for SQL Server};" + odbc_str

    # ODBC Driver requires 'yes' instead of 'True' for Trusted_Connection and TrustServerCertificate
    odbc_str = re.sub(r'(?i)Trusted_Connection\s*=\s*(?:True|1)', 'Trusted_Connection=yes', odbc_str)
    odbc_str = re.sub(r'(?i)TrustServerCertificate\s*=\s*(?:True|1)', 'TrustServerCertificate=yes', odbc_str)

    return f"mssql+pyodbc:///?odbc_connect={urllib.parse.quote_plus(odbc_str)}"


def get_engine():
    global _engine, _SessionLocal
    if _engine is None:
        raw_url = get_settings().database_url
        url = normalize_db_url(raw_url)
        engine_kwargs = {"pool_pre_ping": True}
        if url.startswith("sqlite"):
            engine_kwargs["connect_args"] = {"check_same_thread": False}
        else:
            engine_kwargs.update(pool_size=10, max_overflow=20, pool_recycle=1800)
        _engine = create_engine(url, **engine_kwargs)
        _SessionLocal = sessionmaker(bind=_engine, autoflush=False, expire_on_commit=False)
    return _engine


def get_db() -> Iterator[Session]:
    get_engine()
    db = _SessionLocal()
    try:
        yield db
        db.commit()  # one transaction per request
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
