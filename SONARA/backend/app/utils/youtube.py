"""YouTube audio processing using yt-dlp and ffmpeg for SONARA ecosystem."""
import logging
import os
import re
import shutil
import yt_dlp

log = logging.getLogger("sonara.youtube")

# Find ffmpeg binary
def get_ffmpeg_path() -> str | None:
    path = shutil.which("ffmpeg")
    if path:
        return path
    candidates = [
        r"C:\Program Files\ffmpeg-7.0.2-essentials_build\bin\ffmpeg.exe",
        r"C:\ffmpeg\bin\ffmpeg.exe",
        r"C:\Program Files\ffmpeg\bin\ffmpeg.exe",
    ]
    for c in candidates:
        if os.path.isfile(c):
            return c
    return None

def is_youtube_url(url: str | None) -> bool:
    if not url:
        return False
    u = url.strip().lower()
    return any(domain in u for domain in [
        "youtube.com", "youtu.be", "music.youtube.com", "m.youtube.com"
    ])

def extract_youtube_id(url: str) -> str | None:
    if not url:
        return None
    # Matches ?v=ID, /v/ID, youtu.be/ID, /embed/ID, /shorts/ID
    pattern = r'(?:v=|\/|youtu\.be\/|embed\/|shorts\/)([0-9A-Za-z_-]{11})'
    match = re.search(pattern, url)
    return match.group(1) if match else None

def get_audio_storage_dir() -> str:
    # Prefer main storage/audio directory
    candidates = [
        os.path.abspath("d:/PersonalProject/SONARA/SONARA/storage/audio"),
        os.path.abspath(os.path.join(os.getcwd(), "storage", "audio")),
        os.path.abspath(os.path.join(os.getcwd(), "..", "storage", "audio")),
    ]
    for c in candidates:
        if os.path.isdir(c):
            return c
    # Fallback: create primary
    os.makedirs(candidates[0], exist_ok=True)
    return candidates[0]

def download_youtube_audio(url: str) -> dict | None:
    """Download best audio from YouTube and convert to MP3 using ffmpeg."""
    vid_id = extract_youtube_id(url)
    if not vid_id:
        log.warning(f"Could not extract video ID from YouTube URL: {url}")
        return None

    storage_dir = get_audio_storage_dir()
    expected_mp3 = os.path.join(storage_dir, f"yt_{vid_id}.mp3")
    storage_key = f"audio/yt_{vid_id}.mp3"

    # Also check if it exists in backend/storage/audio
    backend_storage_dir = os.path.abspath("d:/PersonalProject/SONARA/SONARA/backend/storage/audio")
    os.makedirs(backend_storage_dir, exist_ok=True)
    backend_expected_mp3 = os.path.join(backend_storage_dir, f"yt_{vid_id}.mp3")

    if os.path.isfile(expected_mp3) and os.path.getsize(expected_mp3) > 1000:
        log.info(f"YouTube track {vid_id} already cached at {expected_mp3}")
        if not os.path.isfile(backend_expected_mp3):
            try:
                shutil.copy2(expected_mp3, backend_expected_mp3)
            except Exception:
                pass
        return {
            "storage_key": storage_key,
            "title": f"YouTube Audio ({vid_id})",
            "duration": 210,
            "file_path": expected_mp3
        }

    ffmpeg_bin = get_ffmpeg_path()
    log.info(f"Downloading YouTube audio for {vid_id} using ffmpeg: {ffmpeg_bin}...")

    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': os.path.join(storage_dir, f"yt_{vid_id}.%(ext)s"),
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
        'quiet': True,
        'no_warnings': True,
    }
    if ffmpeg_bin:
        ydl_opts['ffmpeg_location'] = ffmpeg_bin

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            title = info.get("title", f"YouTube Track {vid_id}")
            duration = int(info.get("duration") or 210)

        if os.path.isfile(expected_mp3):
            # Sync to backend storage as well
            try:
                shutil.copy2(expected_mp3, backend_expected_mp3)
            except Exception:
                pass

            log.info(f"Successfully downloaded & converted YouTube audio: {expected_mp3} ({os.path.getsize(expected_mp3)} bytes)")
            return {
                "storage_key": storage_key,
                "title": title,
                "duration": duration,
                "file_path": expected_mp3
            }
        else:
            log.error(f"Expected MP3 file not found after yt-dlp execution: {expected_mp3}")
            return None
    except Exception as e:
        log.error(f"Failed to download YouTube audio from {url}: {e}")
        return None
