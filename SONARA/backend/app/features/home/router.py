from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database.session import get_db
from app.models.entities import Song, Artist, Album, SongArtist, Actor, MediaAsset

router = APIRouter(prefix="/home", tags=["home"])

def _get_image(db: Session, asset_id: int | None, fallback: str) -> str:
    if asset_id:
        asset = db.scalar(select(MediaAsset).where(MediaAsset.id == asset_id))
        if asset and asset.storage_key:
            return asset.storage_key
    return fallback

class HomeFeed(BaseModel):
    trending_songs: list[dict] = []
    popular_artists: list[dict] = []
    popular_actors: list[dict] = []
    featured_albums: list[dict] = []
    new_releases: list[dict] = []

@router.get("", response_model=HomeFeed)
def get_home_feed(db: Session = Depends(get_db)):
    # 1. All published songs ordered newest first so new additions appear immediately
    trending_query = (
        select(Song)
        .where(Song.is_deleted == False, Song.is_published == True)
        .order_by(Song.id.desc())
    )
    trending_songs = db.scalars(trending_query).all()

    formatted_songs = []
    for s in trending_songs:
        artists = db.scalars(
            select(Artist).join(SongArtist, Artist.id == SongArtist.artist_id).where(SongArtist.song_id == s.id)
        ).all()
        
        # Resolve song album cover art or fallback to primary artist artwork
        img_url = None
        if s.album_id:
            alb = db.scalar(select(Album).where(Album.id == s.album_id))
            if alb:
                img_url = _get_image(db, alb.cover_asset_id, f"/assets/albums/{alb.id}.jpg")
        if not img_url and artists and artists[0].image_asset_id:
            img_url = _get_image(db, artists[0].image_asset_id, None)

        formatted_songs.append({
            "id": s.id,
            "title": s.title,
            "duration_seconds": s.duration_seconds,
            "play_count": s.play_count,
            "mood": s.mood,
            "stream_url": f"/api/v1/stream/{s.id}",
            "image_url": img_url,
            "album_title": s.album.title if s.album else None,
            "artists": [{"id": a.id, "name": a.name} for a in artists]
        })

    # 2. Popular Artists
    popular_artists = db.scalars(
        select(Artist).where(Artist.is_deleted == False, Artist.is_featured == True).limit(6)
    ).all()
    formatted_artists = [
        {
            "id": a.id,
            "name": a.name,
            "bio": a.bio,
            "country": a.country,
            "image_url": _get_image(db, a.image_asset_id, f"/assets/artists/{a.id}.jpg")
        }
        for a in popular_artists
    ]

    # 3. Popular Actors
    popular_actors = db.scalars(
        select(Actor).where(Actor.is_deleted == False, Actor.is_featured == True).limit(6)
    ).all()
    formatted_actors = [
        {
            "id": act.id,
            "name": act.name,
            "bio": act.bio,
            "image_url": _get_image(db, act.image_asset_id, f"/assets/actors/{act.id}.jpg")
        }
        for act in popular_actors
    ]

    # 4. Featured Albums
    albums = db.scalars(
        select(Album).where(Album.is_deleted == False).order_by(Album.release_year.desc()).limit(6)
    ).all()
    formatted_albums = [
        {
            "id": alb.id,
            "title": alb.title,
            "release_year": alb.release_year,
            "album_type": alb.album_type,
            "cover_url": _get_image(db, alb.cover_asset_id, f"/assets/covers/{alb.id}.jpg")
        }
        for alb in albums
    ]

    return HomeFeed(
        trending_songs=formatted_songs,
        popular_artists=formatted_artists,
        popular_actors=formatted_actors,
        featured_albums=formatted_albums,
        new_releases=formatted_songs[:4]
    )
