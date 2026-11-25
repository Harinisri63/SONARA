from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database.session import get_db
from app.models.entities import Playlist, PlaylistSong, User
from app.features.authentication.dependencies import get_current_user

router = APIRouter(prefix="/me/playlists", tags=["playlists"])

class CreatePlaylistIn(BaseModel):
    name: str
    description: str | None = None

class PlaylistOut(BaseModel):
    id: int
    name: str
    description: str | None = None
    is_public: bool
    song_count: int = 0

class AddSongIn(BaseModel):
    song_id: int

@router.get("", response_model=list[PlaylistOut])
def list_user_playlists(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    stmt = (
        select(Playlist, func.count(PlaylistSong.song_id).label("song_count"))
        .outerjoin(PlaylistSong, Playlist.id == PlaylistSong.playlist_id)
        .where(Playlist.owner_user_id == current_user.id, Playlist.is_deleted == False)
        .group_by(Playlist.id)
        .order_by(Playlist.created_at.desc())
    )
    rows = db.execute(stmt).all()
    return [
        PlaylistOut(
            id=pl.id,
            name=pl.name,
            description=pl.description,
            is_public=pl.is_public,
            song_count=count
        )
        for pl, count in rows
    ]

@router.post("", response_model=PlaylistOut, status_code=status.HTTP_201_CREATED)
def create_playlist(
    body: CreatePlaylistIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    pl = Playlist(
        owner_user_id=current_user.id,
        name=body.name,
        description=body.description,
        is_public=False
    )
    db.add(pl)
    db.commit()
    db.refresh(pl)
    return PlaylistOut(
        id=pl.id,
        name=pl.name,
        description=pl.description,
        is_public=pl.is_public,
        song_count=0
    )

@router.post("/{playlist_id}/songs")
def add_song_to_playlist(
    playlist_id: int,
    body: AddSongIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    pl = db.scalar(
        select(Playlist).where(
            Playlist.id == playlist_id,
            Playlist.owner_user_id == current_user.id,
            Playlist.is_deleted == False
        )
    )
    if not pl:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Playlist not found")

    existing = db.scalar(
        select(PlaylistSong).where(
            PlaylistSong.playlist_id == playlist_id,
            PlaylistSong.song_id == body.song_id
        )
    )
    if not existing:
        max_order = db.scalar(
            select(func.max(PlaylistSong.sort_order)).where(PlaylistSong.playlist_id == playlist_id)
        ) or 0
        db.add(PlaylistSong(playlist_id=playlist_id, song_id=body.song_id, sort_order=max_order + 1))
        db.commit()

    return {"success": True}
