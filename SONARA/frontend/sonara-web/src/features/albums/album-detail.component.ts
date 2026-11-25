import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UpperCasePipe } from '@angular/common';
import { CatalogService } from '../../app/core/services/catalog.service';
import { PlayerService } from '../../app/core/services/player.service';
import { LibraryService } from '../../app/core/services/library.service';
import { AlbumSummary, Track } from '../../app/models/catalog.model';

@Component({
  selector: 'sonara-album-detail',
  standalone: true,
  imports: [UpperCasePipe],
  template: `
    @if (album(); as a) {
      <div class="album-detail">
        <header class="album-hero">
          <div class="album-art-lg">
            @if (a.cover_url) {
              <img [src]="a.cover_url" alt="" class="cover-art-img" />
            } @else {
              💿
            }
          </div>
          <div class="hero-info">
            <span class="badge">{{ a.album_type | uppercase }}</span>
            <h1 class="title">{{ a.title }}</h1>
            <p class="meta">Released: {{ a.release_year }} • {{ a.songs.length }} Tracks</p>
            @if (a.songs && a.songs.length > 0) {
              <button class="play-btn" (click)="playAll(a.songs)">
                ▶ Play Album
              </button>
            }
          </div>
        </header>

        <section class="section">
          <h2>Tracklist</h2>
          <div class="tracks-list">
            @for (song of a.songs; track song.id; let i = $index) {
              <div class="track-row" (click)="playSong(song, a.songs)">
                <span class="index">{{ i + 1 }}</span>
                <div class="title-wrap">
                  <span class="track-title">{{ song.title }}</span>
                  <span class="track-sub">{{ song.mood }}</span>
                </div>
                <span class="duration">{{ player.formatTime(song.duration_seconds) }}</span>
                <button
                  class="fav-btn"
                  [class.active]="library.isFavorite(song.id)"
                  (click)="toggleFavorite($event, song.id)"
                >
                  ♥
                </button>
              </div>
            }
          </div>
        </section>
      </div>
    }
  `,
  styles: [
    `
      .album-detail {
        padding: 32px;
        display: flex;
        flex-direction: column;
        gap: 40px;
      }
      .album-hero {
        display: flex;
        align-items: center;
        gap: 32px;
        padding: 36px;
        border-radius: 20px;
        background: linear-gradient(135deg, rgba(6, 182, 212, 0.25), rgba(139, 92, 246, 0.25));
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      .album-art-lg {
        width: 130px;
        height: 130px;
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.08);
        display: grid;
        place-items: center;
        font-size: 56px;
        overflow: hidden;
      }
      .cover-art-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .badge {
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.1em;
        color: var(--sn-cyan);
        background: rgba(6, 182, 212, 0.15);
        padding: 4px 10px;
        border-radius: 12px;
        border: 1px solid rgba(6, 182, 212, 0.3);
      }
      .title {
        font-size: 36px;
        color: #fff;
        margin: 8px 0;
      }
      .meta {
        color: rgba(255, 255, 255, 0.6);
        font-size: 14px;
        margin: 0 0 20px;
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
      .section h2 {
        font-size: 22px;
        color: #fff;
        margin: 0 0 16px;
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
      .title-wrap {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      .track-title {
        color: #fff;
        font-size: 14px;
        font-weight: 600;
      }
      .track-sub {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.45);
        margin-top: 2px;
      }
      .duration {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.4);
      }
      .fav-btn {
        background: none;
        border: 0;
        color: rgba(255, 255, 255, 0.3);
        font-size: 16px;
        cursor: pointer;
      }
      .fav-btn.active {
        color: #ef4444;
      }
    `,
  ],
})
export class AlbumDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private catalog = inject(CatalogService);
  player = inject(PlayerService);
  library = inject(LibraryService);

  album = signal<(AlbumSummary & { songs: Track[] }) | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.catalog.getAlbum(id).subscribe((data) => this.album.set(data));
    }
  }

  playSong(song: Track, songs: Track[]): void {
    this.player.playTrack(song, songs);
  }

  playAll(songs: Track[]): void {
    if (songs.length > 0) {
      this.player.playTrack(songs[0], songs);
    }
  }

  toggleFavorite(e: Event, songId: number): void {
    e.stopPropagation();
    this.library.toggleFavorite(songId).subscribe();
  }
}
