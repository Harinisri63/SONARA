from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_, select
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database.session import get_db
from app.models.entities import Song, Artist, Movie, Album

router = APIRouter(prefix="/search", tags=["search"])

class SearchResults(BaseModel):
    songs: list[dict] = []
    artists: list[dict] = []
    movies: list[dict] = []
    albums: list[dict] = []

@router.get("", response_model=SearchResults)
def global_search(
    q: str = Query(..., min_length=1),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    pattern = f"%{q.strip().lower()}%"

    # Search Songs
    song_stmt = (
        select(Song)
        .where(Song.is_deleted == False, Song.title.ilike(pattern))
        .order_by(Song.play_count.desc())
        .limit(limit)
    )
    songs = db.scalars(song_stmt).all()
    songs_data = [
        {
            "id": s.id,
            "title": s.title,
            "duration_seconds": s.duration_seconds,
            "play_count": s.play_count,
            "mood": s.mood,
            "stream_url": f"/api/v1/stream/{s.id}",
            "artists": []
        }
        for s in songs
    ]

    # Search Artists
    artist_stmt = (
        select(Artist)
        .where(Artist.is_deleted == False, Artist.name.ilike(pattern))
        .limit(limit)
    )
    artists = db.scalars(artist_stmt).all()
    artists_data = [
        {"id": a.id, "name": a.name, "bio": a.bio, "country": a.country}
        for a in artists
    ]

    # Search Movies
    movie_stmt = (
        select(Movie)
        .where(Movie.is_deleted == False, Movie.title.ilike(pattern))
        .limit(limit)
    )
    movies = db.scalars(movie_stmt).all()
    movies_data = [
        {"id": m.id, "title": m.title, "release_year": m.release_year, "director": m.director}
        for m in movies
    ]

    # Search Albums
    album_stmt = (
        select(Album)
        .where(Album.is_deleted == False, Album.title.ilike(pattern))
        .limit(limit)
    )
    albums = db.scalars(album_stmt).all()
    albums_data = [
        {"id": alb.id, "title": alb.title, "release_year": alb.release_year, "album_type": alb.album_type}
        for alb in albums
    ]

    return SearchResults(
        songs=songs_data,
        artists=artists_data,
        movies=movies_data,
        albums=albums_data
    )
