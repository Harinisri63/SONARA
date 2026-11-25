from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database.session import get_db
from app.models.entities import Movie, MovieActor, Actor, Album, Song, Artist, MediaAsset

def _get_image(db: Session, asset_id: int | None, fallback: str) -> str:
    if asset_id:
        asset = db.scalar(select(MediaAsset).where(MediaAsset.id == asset_id))
        if asset and asset.storage_key:
            return asset.storage_key
    return fallback

router = APIRouter(prefix="/movies", tags=["movies"])

class MovieSummary(BaseModel):
    id: int
    title: str
    release_year: int | None
    director: str | None
    poster_url: str | None = None

class MovieDetail(MovieSummary):
    cast: list[dict] = []
    soundtrack: dict | None = None

@router.get("", response_model=list[MovieSummary])
def list_movies(limit: int = Query(20, ge=1, le=100), db: Session = Depends(get_db)):
    movies = db.scalars(
        select(Movie).where(Movie.is_deleted == False).order_by(Movie.release_year.desc()).limit(limit)
    ).all()
    return [
        MovieSummary(
            id=m.id,
            title=m.title,
            release_year=m.release_year,
            director=m.director,
            poster_url=_get_image(db, m.poster_asset_id, f"/assets/movies/{m.id}.jpg")
        )
        for m in movies
    ]

@router.get("/{movie_id}", response_model=MovieDetail)
def get_movie(movie_id: int, db: Session = Depends(get_db)):
    movie = db.scalar(select(Movie).where(Movie.id == movie_id, Movie.is_deleted == False))
    if not movie:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found")

    # Cast
    cast_rows = db.execute(
        select(Actor, MovieActor.character_name)
        .join(MovieActor, Actor.id == MovieActor.actor_id)
        .where(MovieActor.movie_id == movie_id)
        .order_by(MovieActor.billing_order)
    ).all()

    cast_list = [
        {"actor_id": act.id, "actor_name": act.name, "character": char}
        for act, char in cast_rows
    ]

    # Soundtrack
    album = db.scalar(select(Album).where(Album.movie_id == movie_id, Album.is_deleted == False))
    soundtrack_data = None
    if album:
        songs = db.scalars(
            select(Song).where(Song.album_id == album.id, Song.is_deleted == False).order_by(Song.track_number)
        ).all()
        soundtrack_data = {
            "album_id": album.id,
            "title": album.title,
            "release_year": album.release_year,
            "songs": [
                {
                    "id": s.id,
                    "title": s.title,
                    "duration_seconds": s.duration_seconds,
                    "track_number": s.track_number,
                    "play_count": s.play_count,
                    "mood": s.mood
                }
                for s in songs
            ]
        }

    return MovieDetail(
        id=movie.id,
        title=movie.title,
        release_year=movie.release_year,
        director=movie.director,
        poster_url=_get_image(db, movie.poster_asset_id, f"/assets/movies/{movie.id}.jpg"),
        cast=cast_list,
        soundtrack=soundtrack_data
    )
