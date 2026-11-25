from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database.session import get_db
from app.models.entities import Actor, Movie, MovieActor, Album, Song, MediaAsset

def _get_image(db: Session, asset_id: int | None, fallback: str) -> str:
    if asset_id:
        asset = db.scalar(select(MediaAsset).where(MediaAsset.id == asset_id))
        if asset and asset.storage_key:
            return asset.storage_key
    return fallback

router = APIRouter(prefix="/actors", tags=["actors"])

class ActorSummary(BaseModel):
    id: int
    name: str
    bio: str | None
    is_featured: bool
    image_url: str | None = None

class MovieSoundtrackSummary(BaseModel):
    movie_id: int
    movie_title: str
    release_year: int | None
    character_name: str | None
    director: str | None
    soundtrack_album_id: int | None = None
    songs: list[dict] = []

class ActorDetail(ActorSummary):
    movies: list[MovieSoundtrackSummary] = []

@router.get("", response_model=list[ActorSummary])
def list_actors(
    featured_only: bool = Query(False),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    stmt = select(Actor).where(Actor.is_deleted == False)
    if featured_only:
        stmt = stmt.where(Actor.is_featured == True)
    stmt = stmt.order_by(Actor.name).limit(limit)
    actors = db.scalars(stmt).all()
    return [
        ActorSummary(
            id=a.id,
            name=a.name,
            bio=a.bio,
            is_featured=a.is_featured,
            image_url=_get_image(db, a.image_asset_id, f"/assets/actors/{a.id}.jpg")
        )
        for a in actors
    ]

@router.get("/{actor_id}", response_model=ActorDetail)
def get_actor_with_filmography(actor_id: int, db: Session = Depends(get_db)):
    actor = db.scalar(select(Actor).where(Actor.id == actor_id, Actor.is_deleted == False))
    if not actor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Actor not found")

    # Fetch movies the actor starred in
    movie_q = (
        select(Movie, MovieActor.character_name)
        .join(MovieActor, Movie.id == MovieActor.movie_id)
        .where(MovieActor.actor_id == actor_id, Movie.is_deleted == False)
        .order_by(Movie.release_year.desc())
    )
    movie_rows = db.execute(movie_q).all()

    movies_data = []
    for mov, char_name in movie_rows:
        # Find Soundtrack album associated with this movie
        album = db.scalar(select(Album).where(Album.movie_id == mov.id, Album.is_deleted == False))
        songs_list = []
        album_id = None
        if album:
            album_id = album.id
            songs = db.scalars(
                select(Song)
                .where(Song.album_id == album.id, Song.is_deleted == False)
                .order_by(Song.track_number)
            ).all()
            songs_list = [
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

        movies_data.append(
            MovieSoundtrackSummary(
                movie_id=mov.id,
                movie_title=mov.title,
                release_year=mov.release_year,
                character_name=char_name,
                director=mov.director,
                soundtrack_album_id=album_id,
                songs=songs_list
            )
        )

    return ActorDetail(
        id=actor.id,
        name=actor.name,
        bio=actor.bio,
        is_featured=actor.is_featured,
        image_url=_get_image(db, actor.image_asset_id, f"/assets/actors/{actor.id}.jpg"),
        movies=movies_data
    )
