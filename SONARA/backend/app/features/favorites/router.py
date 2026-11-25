from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database.session import get_db
from app.models.entities import Favorite, Song, User, SongArtist, Artist, MediaAsset, Album
from app.features.authentication.dependencies import get_current_user

router = APIRouter(prefix="/me/favorites", tags=["favorites"])

class ToggleFavoriteOut(BaseModel):
    favorited: bool

@router.get("/ids", response_model=list[int])
def get_favorite_song_ids(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    stmt = select(Favorite.entity_id).where(
        Favorite.user_id == current_user.id,
        Favorite.entity_type == "song"
    )
    ids = db.scalars(stmt).all()
    return [int(i) for i in ids]

@router.get("", response_model=list[dict])
def list_favorites(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    stmt = (
        select(Song)
        .join(Favorite, (Song.id == Favorite.entity_id) & (Favorite.entity_type == "song"))
        .where(Favorite.user_id == current_user.id, Song.is_deleted == False)
        .order_by(Favorite.created_at.desc())
    )
    songs = db.scalars(stmt).all()

    results = []
    for s in songs:
        artist_rows = db.scalars(
            select(Artist).join(SongArtist, Artist.id == SongArtist.artist_id).where(SongArtist.song_id == s.id)
        ).all()
        
        image_url = None
        if s.album_id:
            alb = db.scalar(select(Album).where(Album.id == s.album_id))
            if alb and alb.cover_asset_id:
                asset = db.scalar(select(MediaAsset).where(MediaAsset.id == alb.cover_asset_id))
                if asset and asset.storage_key:
                    image_url = asset.storage_key

        results.append({
            "id": s.id,
            "title": s.title,
            "duration_seconds": s.duration_seconds,
            "play_count": s.play_count,
            "mood": s.mood,
            "stream_url": f"/api/v1/stream/{s.id}",
            "image_url": image_url,
            "artists": [{"id": a.id, "name": a.name} for a in artist_rows]
        })
    return results

@router.post("/{song_id}", response_model=ToggleFavoriteOut)
def toggle_favorite(
    song_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify song exists
    song = db.scalar(select(Song).where(Song.id == song_id, Song.is_deleted == False))
    if not song:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Song not found")

    existing = db.scalar(
        select(Favorite).where(
            Favorite.user_id == current_user.id,
            Favorite.entity_type == "song",
            Favorite.entity_id == song_id
        )
    )
    if existing:
        db.delete(existing)
        db.commit()
        return ToggleFavoriteOut(favorited=False)
    else:
        fav = Favorite(user_id=current_user.id, entity_type="song", entity_id=song_id)
        db.add(fav)
        db.commit()
        return ToggleFavoriteOut(favorited=True)
