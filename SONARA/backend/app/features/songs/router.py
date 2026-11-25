from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database.session import get_db
from app.models.entities import Song, SongArtist, Artist, Album, Lyrics, MediaAsset

def _resolve_song_media(db: Session, song: Song):
    image_url = None
    if song.album_id:
        alb = db.scalar(select(Album).where(Album.id == song.album_id))
        if alb and alb.cover_asset_id:
            asset = db.scalar(select(MediaAsset).where(MediaAsset.id == alb.cover_asset_id))
            if asset and asset.storage_key:
                image_url = asset.storage_key

    audio_url = None
    if song.audio_asset_id:
        asset = db.scalar(select(MediaAsset).where(MediaAsset.id == song.audio_asset_id))
        if asset and asset.storage_key:
            audio_url = asset.storage_key

    return image_url, audio_url

router = APIRouter(prefix="/songs", tags=["songs"])

class SongSummary(BaseModel):
    id: int
    title: str
    duration_seconds: int | None
    play_count: int
    mood: str | None
    album_id: int | None
    album_title: str | None = None
    stream_url: str
    audio_url: str | None = None
    image_url: str | None = None
    artists: list[dict] = []

class SongDetail(SongSummary):
    lyrics: str | None = None

@router.get("", response_model=list[SongSummary])
def list_songs(
    trending: bool = Query(False),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    stmt = select(Song).where(Song.is_deleted == False, Song.is_published == True)
    if trending:
        stmt = stmt.order_by(Song.play_count.desc())
    else:
        stmt = stmt.order_by(Song.title)
    songs = db.scalars(stmt.limit(limit)).all()

    results = []
    for s in songs:
        album_title = s.album.title if s.album else None
        artist_rows = db.scalars(
            select(Artist).join(SongArtist, Artist.id == SongArtist.artist_id).where(SongArtist.song_id == s.id)
        ).all()
        img_url, aud_url = _resolve_song_media(db, s)
        results.append(
            SongSummary(
                id=s.id,
                title=s.title,
                duration_seconds=s.duration_seconds,
                play_count=s.play_count,
                mood=s.mood,
                album_id=s.album_id,
                album_title=album_title,
                stream_url=f"/api/v1/stream/{s.id}",
                audio_url=aud_url,
                image_url=img_url,
                artists=[{"id": a.id, "name": a.name} for a in artist_rows]
            )
        )
    return results

@router.get("/{song_id}", response_model=SongDetail)
def get_song(song_id: int, db: Session = Depends(get_db)):
    song = db.scalar(select(Song).where(Song.id == song_id, Song.is_deleted == False))
    if not song:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Song not found")

    artist_rows = db.scalars(
        select(Artist).join(SongArtist, Artist.id == SongArtist.artist_id).where(SongArtist.song_id == song.id)
    ).all()

    lyrics = db.scalar(select(Lyrics).where(Lyrics.song_id == song.id))
    img_url, aud_url = _resolve_song_media(db, song)

    return SongDetail(
        id=song.id,
        title=song.title,
        duration_seconds=song.duration_seconds,
        play_count=song.play_count,
        mood=song.mood,
        album_id=song.album_id,
        album_title=song.album.title if song.album else None,
        stream_url=f"/api/v1/stream/{song.id}",
        audio_url=aud_url,
        image_url=img_url,
        artists=[{"id": a.id, "name": a.name} for a in artist_rows],
        lyrics=lyrics.plain_text if lyrics else None
    )
