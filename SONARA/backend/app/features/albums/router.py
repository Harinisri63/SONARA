from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database.session import get_db
from app.models.entities import Album, Song, AlbumArtist, Artist, MediaAsset

def _get_image(db: Session, asset_id: int | None, fallback: str) -> str:
    if asset_id:
        asset = db.scalar(select(MediaAsset).where(MediaAsset.id == asset_id))
        if asset and asset.storage_key:
            return asset.storage_key
    return fallback

router = APIRouter(prefix="/albums", tags=["albums"])

class AlbumSummary(BaseModel):
    id: int
    title: str
    release_year: int | None
    album_type: str
    cover_url: str | None = None

class AlbumDetail(AlbumSummary):
    artists: list[dict] = []
    songs: list[dict] = []

@router.get("", response_model=list[AlbumSummary])
def list_albums(limit: int = Query(20, ge=1, le=100), db: Session = Depends(get_db)):
    albums = db.scalars(
        select(Album).where(Album.is_deleted == False).order_by(Album.release_year.desc()).limit(limit)
    ).all()
    return [
        AlbumSummary(
            id=a.id,
            title=a.title,
            release_year=a.release_year,
            album_type=a.album_type,
            cover_url=_get_image(db, a.cover_asset_id, f"/assets/covers/{a.id}.jpg")
        )
        for a in albums
    ]

@router.get("/{album_id}", response_model=AlbumDetail)
def get_album(album_id: int, db: Session = Depends(get_db)):
    album = db.scalar(select(Album).where(Album.id == album_id, Album.is_deleted == False))
    if not album:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Album not found")

    artists = db.scalars(
        select(Artist)
        .join(AlbumArtist, Artist.id == AlbumArtist.artist_id)
        .where(AlbumArtist.album_id == album_id)
    ).all()

    songs = db.scalars(
        select(Song).where(Song.album_id == album_id, Song.is_deleted == False).order_by(Song.track_number)
    ).all()

    return AlbumDetail(
        id=album.id,
        title=album.title,
        release_year=album.release_year,
        album_type=album.album_type,
        cover_url=_get_image(db, album.cover_asset_id, f"/assets/covers/{album.id}.jpg"),
        artists=[{"id": a.id, "name": a.name} for a in artists],
        songs=[
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
    )
