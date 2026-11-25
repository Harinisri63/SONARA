from contextlib import asynccontextmanager
import logging

from fastapi import APIRouter, FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.errors import register_error_handlers
from app.database.base import Base
from app.database.session import get_db, get_engine
import app.models  # noqa: F401
from app.features.authentication.router import router as auth_router
from app.features.home.router import router as home_router
from app.features.artists.router import router as artists_router
from app.features.actors.router import router as actors_router
from app.features.movies.router import router as movies_router
from app.features.albums.router import router as albums_router
from app.features.songs.router import router as songs_router
from app.features.streaming.router import router as streaming_router
from app.features.search.router import router as search_router
from app.features.favorites.router import router as favorites_router
from app.features.playlists.router import router as playlists_router
from app.features.admin.router import router as admin_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")

@asynccontextmanager
async def lifespan(_: FastAPI):
    # Ensure database schema is initialized
    Base.metadata.create_all(bind=get_engine())
    yield

api_v1 = APIRouter(prefix="/api/v1")
api_v1.include_router(auth_router)
api_v1.include_router(home_router)
api_v1.include_router(artists_router)
api_v1.include_router(actors_router)
api_v1.include_router(movies_router)
api_v1.include_router(albums_router)
api_v1.include_router(songs_router)
api_v1.include_router(streaming_router)
api_v1.include_router(search_router)
api_v1.include_router(favorites_router)
api_v1.include_router(playlists_router)
api_v1.include_router(admin_router)


@api_v1.get("/health", tags=["system"])
def health(db: Session = Depends(get_db)) -> dict:
    db.execute(text("SELECT 1"))
    return {"status": "ok", "database": "up"}


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="SONARA API", version="0.1.0", lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,  # needed for HttpOnly cookie auth on web
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
        allow_headers=["Content-Type", "Authorization", "X-Client", "X-CSRF-Token", "Range"],
    )
    register_error_handlers(app)
    app.include_router(api_v1)
    return app


app = create_app()
