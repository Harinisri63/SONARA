from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database.session import get_db
from app.models.entities import Artist, Song, SongArtist, Album, AlbumArtist, MediaAsset

def _get_image(db: Session, asset_id: int | None, fallback: str) -> str:
    if asset_id:
        asset = db.scalar(select(MediaAsset).where(MediaAsset.id == asset_id))
        if asset and asset.storage_key:
            return asset.storage_key
    return fallback

router = APIRouter(prefix="/artists", tags=["artists"])

class ArtistSummary(BaseModel):
    id: int
    name: str
    bio: str | None
    country: str | None
    is_featured: bool
    image_url: str | None = None

class ArtistDetail(ArtistSummary):
    songs: list[dict] = []
    albums: list[dict] = []

@router.get("", response_model=list[ArtistSummary])
def list_artists(
    featured_only: bool = Query(False),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    stmt = select(Artist).where(Artist.is_deleted == False)
    if featured_only:
        stmt = stmt.where(Artist.is_featured == True)
    stmt = stmt.order_by(Artist.name).limit(limit)
    artists = db.scalars(stmt).all()
    return [
        ArtistSummary(
            id=a.id,
            name=a.name,
            bio=a.bio,
            country=a.country,
            is_featured=a.is_featured,
            image_url=_get_image(db, a.image_asset_id, f"/assets/artists/{a.id}.jpg")
        )
        for a in artists
    ]

@router.get("/{artist_id}", response_model=ArtistDetail)
def get_artist(artist_id: int, db: Session = Depends(get_db)):
    artist = db.scalar(select(Artist).where(Artist.id == artist_id, Artist.is_deleted == False))
    if not artist:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artist not found")

    # Fetch popular songs credited to artist
    song_stmt = (
        select(Song)
        .join(SongArtist, Song.id == SongArtist.song_id)
        .where(SongArtist.artist_id == artist_id, Song.is_deleted == False)
        .order_by(Song.play_count.desc())
        .limit(10)
    )
    songs = db.scalars(song_stmt).all()

    # Fetch albums by artist
    album_stmt = (
        select(Album)
        .join(AlbumArtist, Album.id == AlbumArtist.album_id)
        .where(AlbumArtist.artist_id == artist_id, Album.is_deleted == False)
        .order_by(Album.release_year.desc())
    )
    albums = db.scalars(album_stmt).all()

    return ArtistDetail(
        id=artist.id,
        name=artist.name,
        bio=artist.bio,
        country=artist.country,
        is_featured=artist.is_featured,
        image_url=_get_image(db, artist.image_asset_id, f"/assets/artists/{artist.id}.jpg"),
        songs=[
            {
                "id": s.id,
                "title": s.title,
                "duration_seconds": s.duration_seconds,
                "play_count": s.play_count,
                "mood": s.mood
            }
            for s in songs
        ],
        albums=[
            {
                "id": alb.id,
                "title": alb.title,
                "release_year": alb.release_year,
                "album_type": alb.album_type
            }
            for alb in albums
        ]
    )
