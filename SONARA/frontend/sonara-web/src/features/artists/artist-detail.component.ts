import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CatalogService } from '../../app/core/services/catalog.service';
import { PlayerService } from '../../app/core/services/player.service';
import { LibraryService } from '../../app/core/services/library.service';
import { AlbumSummary, ArtistSummary, Track } from '../../app/models/catalog.model';

@Component({
  selector: 'sonara-artist-detail',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (artist(); as a) {
      <div class="artist-detail">
        <!-- Hero Header -->
        <header class="hero">
          <div class="avatar">
            @if (a.image_url) {
              <img [src]="a.image_url" alt="" class="avatar-img" />
            } @else {
              {{ a.name.charAt(0) }}
            }
          </div>
          <div class="info">
            <span class="badge">VERIFIED ARTIST</span>
            <h1 class="name">{{ a.name }}</h1>
            <p class="bio">{{ a.bio }}</p>
            @if (a.songs && a.songs.length > 0) {
              <button class="play-btn" (click)="playAll(a.songs)">
                ▶ Play Popular Tracks
              </button>
            }
          </div>
        </header>

        <!-- Popular Tracks -->
        <section class="section">
          <h2>Popular Tracks</h2>
          <div class="tracks-list">
            @for (song of a.songs; track song.id; let i = $index) {
              <div class="track-row" (click)="playSong(song, a.songs)">
                <span class="index">{{ i + 1 }}</span>
                <div class="title-wrap">
                  <span class="title">{{ song.title }}</span>
                  <span class="plays">{{ song.play_count?.toLocaleString() }} plays</span>
                </div>
                <span class="duration">{{ player.formatTime(song.duration_seconds) }}</span>
                <button
                  class="like-btn"
                  [class.active]="library.isFavorite(song.id)"
                  (click)="toggleFavorite($event, song.id)"
                >
                  ♥
                </button>
              </div>
            }
          </div>
        </section>

        <!-- Discography / Albums -->
        <section class="section">
          <h2>Discography & Albums</h2>
          <div class="albums-grid">
            @for (alb of a.albums; track alb.id) {
              <a [routerLink]="['/albums', alb.id]" class="album-card">
                <div class="art">💿</div>
                <span class="title">{{ alb.title }}</span>
                <span class="year">{{ alb.release_year }} • {{ alb.album_type }}</span>
              </a>
            }
          </div>
        </section>
      </div>
    }
  `,
  styles: [
    `
      .artist-detail {
        padding: 32px;
        display: flex;
        flex-direction: column;
        gap: 40px;
      }
      .hero {
        display: flex;
        align-items: center;
        gap: 32px;
        padding: 36px;
        border-radius: 20px;
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(6, 182, 212, 0.25));
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      .avatar {
        width: 130px;
        height: 130px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--sn-violet), var(--sn-cyan));
        color: #fff;
        display: grid;
        place-items: center;
        font-size: 52px;
        font-weight: 800;
        box-shadow: 0 0 30px rgba(6, 182, 212, 0.4);
        overflow: hidden;
      }
      .avatar-img {
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
      .name {
        font-size: 38px;
        color: #fff;
        margin: 8px 0;
      }
      .bio {
        color: rgba(255, 255, 255, 0.7);
        font-size: 15px;
        max-width: 650px;
        line-height: 1.5;
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
      .title-wrap .title {
        color: #fff;
        font-size: 14px;
        font-weight: 600;
      }
      .plays {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.45);
        margin-top: 2px;
      }
      .duration {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.4);
      }
      .like-btn {
        background: none;
        border: 0;
        color: rgba(255, 255, 255, 0.3);
        font-size: 16px;
        cursor: pointer;
      }
      .like-btn.active {
        color: #ef4444;
      }
      .albums-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 20px;
      }
      .album-card {
        padding: 16px;
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.05);
        text-decoration: none;
        transition: all 0.2s;
      }
      .album-card:hover {
        background: rgba(255, 255, 255, 0.06);
        border-color: var(--sn-cyan);
        transform: translateY(-4px);
      }
      .art {
        width: 100%;
        aspect-ratio: 1;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.06);
        display: grid;
        place-items: center;
        font-size: 36px;
        margin-bottom: 12px;
      }
      .album-card .title {
        display: block;
        color: #fff;
        font-size: 14px;
        font-weight: 600;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
      .year {
        display: block;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.4);
        margin-top: 4px;
      }
    `,
  ],
})
export class ArtistDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private catalog = inject(CatalogService);
  player = inject(PlayerService);
  library = inject(LibraryService);

  artist = signal<(ArtistSummary & { songs: Track[]; albums: AlbumSummary[] }) | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.catalog.getArtist(id).subscribe((data) => this.artist.set(data));
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
