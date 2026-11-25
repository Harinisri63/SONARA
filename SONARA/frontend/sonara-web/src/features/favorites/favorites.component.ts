import { Component, OnInit, inject, signal } from '@angular/core';
import { LibraryService } from '../../app/core/services/library.service';
import { PlayerService } from '../../app/core/services/player.service';
import { Track } from '../../app/models/catalog.model';

@Component({
  selector: 'sonara-favorites',
  standalone: true,
  template: `
    <div class="fav-page">
      <header class="fav-hero">
        <div class="fav-icon-box">♥</div>
        <div class="fav-meta">
          <span class="badge">PLAYLIST</span>
          <h1>Liked Songs</h1>
          <p>{{ songs().length }} tracks in your personal collection</p>
          @if (songs().length > 0) {
            <button class="play-btn" (click)="playAll()">▶ Play All</button>
          }
        </div>
      </header>

      <section class="tracks-container">
        @if (songs().length === 0) {
          <div class="empty-state">
            <span class="empty-icon">♡</span>
            <h3>No favorites yet</h3>
            <p>Click the heart icon on any song to save it to your collection.</p>
          </div>
        } @else {
          <div class="tracks-list">
            @for (song of songs(); track song.id; let i = $index) {
              <div class="track-row" (click)="playSong(song)">
                <span class="index">{{ i + 1 }}</span>
                <div class="thumb">
                  @if (song.image_url) {
                    <img [src]="song.image_url" alt="" class="thumb-img" />
                  } @else {
                    <span>💿</span>
                  }
                </div>
                <div class="meta">
                  <span class="title">{{ song.title }}</span>
                  <span class="artists">{{ getArtistNames(song) }}</span>
                </div>
                <span class="duration">{{ player.formatTime(song.duration_seconds) }}</span>
                <button class="remove-btn" (click)="removeFavorite($event, song.id)">♥</button>
              </div>
            }
          </div>
        }
      </section>
    </div>
  `,
  styles: [
    `
      .fav-page {
        padding: 32px;
        display: flex;
        flex-direction: column;
        gap: 36px;
      }
      .fav-hero {
        display: flex;
        align-items: center;
        gap: 32px;
        padding: 36px;
        border-radius: 20px;
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(139, 92, 246, 0.25));
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      .fav-icon-box {
        width: 120px;
        height: 120px;
        border-radius: 16px;
        background: linear-gradient(135deg, #ef4444, #8b5cf6);
        color: #fff;
        display: grid;
        place-items: center;
        font-size: 56px;
        box-shadow: 0 0 30px rgba(239, 68, 68, 0.4);
      }
      .badge {
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.1em;
        color: #ef4444;
      }
      .fav-meta h1 {
        font-size: 40px;
        color: #fff;
        margin: 6px 0;
      }
      .fav-meta p {
        color: rgba(255, 255, 255, 0.6);
        font-size: 14px;
        margin: 0 0 18px;
      }
      .play-btn {
        padding: 12px 24px;
        border-radius: 24px;
        background: #fff;
        color: #000;
        border: 0;
        font-weight: 700;
        cursor: pointer;
        transition: transform 0.2s;
      }
      .play-btn:hover {
        transform: scale(1.05);
      }
      .empty-state {
        text-align: center;
        padding: 60px 20px;
        color: rgba(255, 255, 255, 0.4);
      }
      .empty-icon {
        font-size: 48px;
      }
      .tracks-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .track-row {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 12px 18px;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.02);
        cursor: pointer;
        transition: all 0.2s;
      }
      .track-row:hover {
        background: rgba(255, 255, 255, 0.08);
      }
      .index {
        width: 20px;
        color: rgba(255, 255, 255, 0.4);
        font-size: 13px;
      }
      .thumb {
        width: 44px;
        height: 44px;
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.05);
        display: grid;
        place-items: center;
        overflow: hidden;
      }
      .thumb-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .meta {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      .title {
        color: #fff;
        font-size: 14px;
        font-weight: 600;
      }
      .artists {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.45);
        margin-top: 2px;
      }
      .duration {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.4);
      }
      .remove-btn {
        background: none;
        border: 0;
        color: #ef4444;
        font-size: 18px;
        cursor: pointer;
      }
    `,
  ],
})
export class FavoritesComponent implements OnInit {
  private library = inject(LibraryService);
  player = inject(PlayerService);

  songs = signal<Track[]>([]);

  ngOnInit(): void {
    this.library.getFavorites().subscribe((list) => this.songs.set(list));
  }

  getArtistNames(song: Track): string {
    return song.artists?.map((a) => a.name).join(', ') || 'Various Artists';
  }

  playSong(song: Track): void {
    this.player.playTrack(song, this.songs());
  }

  playAll(): void {
    if (this.songs().length > 0) {
      this.player.playTrack(this.songs()[0], this.songs());
    }
  }

  removeFavorite(e: Event, songId: number): void {
    e.stopPropagation();
    this.library.toggleFavorite(songId).subscribe(() => {
      this.songs.set(this.songs().filter((s) => s.id !== songId));
    });
  }
}
