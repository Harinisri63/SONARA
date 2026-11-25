import os
from fastapi import APIRouter, Depends, Header, HTTPException, Response, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.entities import Song, MediaAsset
from app.utils.youtube import is_youtube_url, download_youtube_audio

router = APIRouter(prefix="/stream", tags=["streaming"])

# A minimal valid silent / synthetic audio wave generator fallback if physical file does not exist locally
def _generate_synthetic_tone(duration_seconds: int = 180) -> bytes:
    import io
    import wave
    import math

    sample_rate = 44100
    num_samples = sample_rate * min(duration_seconds, 30)
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wav:
        wav.setnchannels(2)
        wav.setsampwidth(2)
        wav.setframerate(sample_rate)
        # Synthesize ambient harmonic chord: 432Hz + 528Hz + 639Hz
        frames = bytearray()
        for i in range(num_samples):
            t = float(i) / sample_rate
            val = (
                math.sin(2.0 * math.pi * 432.0 * t) * 0.3 +
                math.sin(2.0 * math.pi * 528.0 * t) * 0.2 +
                math.sin(2.0 * math.pi * 639.0 * t) * 0.1
            )
            sample = int(val * 32767.0 * 0.5)
            # 2 bytes per channel, 2 channels
            raw = sample.to_bytes(2, byteorder="little", signed=True)
            frames.extend(raw)
            frames.extend(raw)
        wav.writeframes(frames)
    return buf.getvalue()

_SYNTH_AUDIO_CACHE = None

def get_fallback_audio() -> bytes:
    global _SYNTH_AUDIO_CACHE
    if _SYNTH_AUDIO_CACHE is None:
        _SYNTH_AUDIO_CACHE = _generate_synthetic_tone()
    return _SYNTH_AUDIO_CACHE

@router.get("/{song_id}")
def stream_audio(
    song_id: int,
    range: str | None = Header(None),
    db: Session = Depends(get_db)
):
    song = db.scalar(select(Song).where(Song.id == song_id, Song.is_deleted == False))
    if not song:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Song not found")

    # Increment play count
    song.play_count += 1
    db.commit()

    # Locate media asset
    file_bytes = None
    media_path = None
    if song.audio_asset_id:
        asset = db.scalar(select(MediaAsset).where(MediaAsset.id == song.audio_asset_id))
        if asset and asset.storage_key:
            # If YouTube link, extract audio automatically
            if is_youtube_url(asset.storage_key):
                yt_info = download_youtube_audio(asset.storage_key)
                if yt_info:
                    asset.storage_key = yt_info["storage_key"]
                    db.commit()

            if asset.storage_key.startswith("http://") or asset.storage_key.startswith("https://"):
                from fastapi.responses import RedirectResponse
                return RedirectResponse(url=asset.storage_key, status_code=status.HTTP_307_TEMPORARY_REDIRECT)
            
            candidate_paths = [
                os.path.abspath(os.path.join(os.getcwd(), "storage", asset.storage_key)),
                os.path.abspath(os.path.join(os.getcwd(), "..", "storage", asset.storage_key)),
                os.path.abspath(os.path.join("d:/PersonalProject/SONARA/SONARA/storage", asset.storage_key)),
            ]
            for cp in candidate_paths:
                if os.path.isfile(cp):
                    media_path = cp
                    break

    if media_path and os.path.isfile(media_path):
        file_size = os.path.getsize(media_path)
        content_type = "audio/mpeg"
        
        # Range request support (HTTP 206)
        if range:
            byte_range = range.replace("bytes=", "").split("-")
            start = int(byte_range[0])
            end = int(byte_range[1]) if byte_range[1] else file_size - 1
            chunk_size = (end - start) + 1

            def iter_file():
                with open(media_path, "rb") as f:
                    f.seek(start)
                    bytes_left = chunk_size
                    while bytes_left > 0:
                        read_size = min(bytes_left, 64 * 1024)
                        data = f.read(read_size)
                        if not data:
                            break
                        bytes_left -= len(data)
                        yield data

            headers = {
                "Content-Range": f"bytes {start}-{end}/{file_size}",
                "Accept-Ranges": "bytes",
                "Content-Length": str(chunk_size),
                "Content-Type": content_type,
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
            }
            return StreamingResponse(iter_file(), status_code=status.HTTP_206_PARTIAL_CONTENT, headers=headers)
        else:
            def iter_full():
                with open(media_path, "rb") as f:
                    while chunk := f.read(64 * 1024):
                        yield chunk
            return StreamingResponse(
                iter_full(),
                media_type=content_type,
                headers={
                    "Accept-Ranges": "bytes",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*",
                }
            )

    # Fallback to in-memory wave harmonic stream
    audio_data = get_fallback_audio()
    total_len = len(audio_data)

    if range:
        byte_range = range.replace("bytes=", "").split("-")
        start = int(byte_range[0])
        end = int(byte_range[1]) if byte_range[1] else total_len - 1
        chunk = audio_data[start:end + 1]

        headers = {
            "Content-Range": f"bytes {start}-{end}/{total_len}",
            "Accept-Ranges": "bytes",
            "Content-Length": str(len(chunk)),
            "Content-Type": "audio/wav",
        }
        return Response(content=chunk, status_code=status.HTTP_206_PARTIAL_CONTENT, headers=headers)

    return Response(
        content=audio_data,
        media_type="audio/wav",
        headers={"Accept-Ranges": "bytes", "Content-Length": str(total_len)}
    )
