import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../app/core/services/catalog.service';
import { PlayerService } from '../../app/core/services/player.service';
import { LibraryService } from '../../app/core/services/library.service';
import { HomeFeed, Track } from '../../app/models/catalog.model';

@Component({
  selector: 'sonara-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="home-container">
      <!-- 1. Hero Showcase -->
      <section class="hero-card">
        <div class="hero-content">
          <span class="pill">TRENDING SPOTLIGHT</span>
          <h1 class="hero-title">Hukum – Thalaivar Alappara</h1>
          <p class="hero-desc">
            Anirudh Ravichander’s chart-shattering explosive anthem from Superstar Rajinikanth's <em>Jailer</em>.
          </p>
          <div class="hero-actions">
            @if (firstTrack(); as track) {
              <button class="play-primary" (click)="playSong(track)">
                <span class="icon">▶</span> PLAY NOW
              </button>
            }
            <a routerLink="/actors" class="explore-btn">EXPLORE SOUNDTRACKS</a>
          </div>
        </div>
      </section>

      <!-- 2. Trending Songs -->
      <section class="section">
        <div class="section-header">
          <div>
            <h2>Trending Hits & Releases</h2>
            <span class="section-sub">Top streams and latest additions across the ecosystem</span>
          </div>
          @if (totalSongs() > 0) {
            <span class="pagination-badge">Showing {{ startIndex() }}-{{ endIndex() }} of {{ totalSongs() }} songs</span>
          }
        </div>
        <div class="songs-grid">
          @for (song of paginatedSongs(); track song.id) {
            <div class="song-card" (click)="playSong(song)">
              <div class="cover">
                @if (song.image_url) {
                  <img [src]="song.image_url" alt="" class="card-cover-img" />
                } @else {
                  <span class="disc">💿</span>
                }
                <button class="overlay-play">▶</button>
              </div>
              <div class="details">
                <span class="song-name">{{ song.title }}</span>
                <span class="song-artists">{{ getArtistNames(song) }}</span>
              </div>
              <span class="duration">{{ player.formatTime(song.duration_seconds) }}</span>
              <button
                class="like-btn"
                [class.liked]="library.isFavorite(song.id)"
                (click)="toggleLike($event, song.id)"
              >
                ♥
              </button>
            </div>
          }
        </div>

        <!-- Pagination Controls -->
        @if (totalPages() > 1) {
          <div class="pagination-bar">
            <button
              class="page-nav-btn"
              [disabled]="currentPage() === 1"
              (click)="prevPage()"
            >
              ‹ Previous
            </button>
            <div class="page-pills">
              @for (p of pageNumbers(); track p) {
                <button
                  class="page-num-btn"
                  [class.active]="p === currentPage()"
                  (click)="setPage(p)"
                >
                  {{ p }}
                </button>
              }
            </div>
            <button
              class="page-nav-btn"
              [disabled]="currentPage() === totalPages()"
              (click)="nextPage()"
            >
              Next ›
            </button>
          </div>
        }
      </section>

      <!-- 3. Featured Artists -->
      <section class="section">
        <div class="section-header">
          <h2>Featured Composers & Artists</h2>
          <span class="section-sub">Pioneers of cinematic and modern melody</span>
        </div>
        <div class="artists-grid">
          @for (artist of feed()?.popular_artists; track artist.id) {
            <a [routerLink]="['/artists', artist.id]" class="artist-card">
              <div class="avatar-ring">
                @if (artist.image_url) {
                  <img [src]="artist.image_url" alt="" class="avatar-img" />
                } @else {
                  <div class="artist-avatar">{{ artist.name.charAt(0) }}</div>
                }
              </div>
              <span class="artist-name">{{ artist.name }}</span>
              <span class="artist-role">Composer</span>
            </a>
          }
        </div>
      </section>

      <!-- 4. Actor-to-Movie-to-Soundtrack Workflow Banner -->
      <section class="workflow-banner">
        <div class="wf-left">
          <span class="pill-alt">CINEMATIC DISCOVERY</span>
          <h2>Actor ➔ Movies ➔ Soundtracks</h2>
          <p>Explore your favorite star's filmography and stream their complete movie soundtracks directly.</p>
          <a routerLink="/actors" class="wf-cta">Discover Actors</a>
        </div>
        <div class="actor-chips">
          @for (actor of feed()?.popular_actors; track actor.id) {
            <a [routerLink]="['/actors', actor.id]" class="chip">
              <span class="star-icon">★</span>
              <span>{{ actor.name }}</span>
            </a>
          }
        </div>
      </section>

      <!-- 5. Featured Soundtracks & Albums -->
      <section class="section">
        <div class="section-header">
          <h2>Popular Soundtracks & Albums</h2>
          <span class="section-sub">Original motion picture releases</span>
        </div>
        <div class="albums-grid">
          @for (album of feed()?.featured_albums; track album.id) {
            <a [routerLink]="['/albums', album.id]" class="album-card">
              <div class="album-art">
                @if (album.cover_url) {
                  <img [src]="album.cover_url" alt="" class="album-cover-img" />
                } @else {
                  <span class="art-icon">🎬</span>
                }
                <div class="type-tag">{{ album.album_type }}</div>
              </div>
              <span class="album-title">{{ album.title }}</span>
              <span class="album-year">{{ album.release_year }}</span>
            </a>
          }
        </div>
      </section>
    </div>
  `,
  styles: [
    `
      .home-container {
        padding: 32px;
        display: flex;
        flex-direction: column;
        gap: 48px;
        box-sizing: border-box;
      }
      .hero-card {
        border-radius: 20px;
        padding: 48px;
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.4), rgba(6, 182, 212, 0.2)),
                    radial-gradient(circle at top right, rgba(236, 72, 153, 0.3), transparent);
        border: 1px solid rgba(255, 255, 255, 0.15);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
        position: relative;
        overflow: hidden;
      }
      .pill, .pill-alt {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.1em;
        margin-bottom: 12px;
      }
      .pill {
        background: rgba(6, 182, 212, 0.2);
        color: var(--sn-cyan);
        border: 1px solid rgba(6, 182, 212, 0.4);
      }
      .pill-alt {
        background: rgba(139, 92, 246, 0.25);
        color: #c084fc;
        border: 1px solid rgba(139, 92, 246, 0.4);
      }
      .hero-title {
        font-size: 38px;
        font-weight: 800;
        margin: 0 0 12px;
        color: #fff;
      }
      .hero-desc {
        color: rgba(255, 255, 255, 0.75);
        font-size: 16px;
        max-width: 580px;
        margin: 0 0 28px;
        line-height: 1.5;
      }
      .hero-actions {
        display: flex;
        gap: 16px;
      }
      .play-primary {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 24px;
        border-radius: 24px;
        background: #fff;
        color: #000;
        border: 0;
        font-weight: 700;
        font-size: 14px;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .play-primary:hover {
        transform: scale(1.05);
        box-shadow: 0 0 20px rgba(255, 255, 255, 0.6);
      }
      .explore-btn, .wf-cta {
        padding: 12px 20px;
        border-radius: 24px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: #fff;
        text-decoration: none;
        font-size: 13px;
        font-weight: 600;
        display: grid;
        place-items: center;
        transition: all 0.2s;
      }
      .explore-btn:hover, .wf-cta:hover {
        background: rgba(255, 255, 255, 0.2);
        border-color: var(--sn-cyan);
      }
      .section {
        display: flex;
        flex-direction: column;
        gap: 18px;
      }
      .section-header h2 {
        font-size: 22px;
        font-weight: 700;
        margin: 0;
        color: #fff;
      }
      .section-sub {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.45);
      }
      .songs-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 14px;
      }
      .song-card {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 12px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.06);
        cursor: pointer;
        transition: all 0.2s;
      }
      .song-card:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(6, 182, 212, 0.3);
        transform: translateY(-2px);
      }
      .cover {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(6, 182, 212, 0.3));
        display: grid;
        place-items: center;
        font-size: 20px;
        position: relative;
        overflow: hidden;
      }
      .card-cover-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .overlay-play {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        border: 0;
        color: #fff;
        display: grid;
        place-items: center;
        border-radius: 8px;
        opacity: 0;
        transition: opacity 0.2s;
      }
      .song-card:hover .overlay-play {
        opacity: 1;
      }
      .details {
        flex: 1;
        overflow: hidden;
      }
      .song-name {
        display: block;
        color: #fff;
        font-size: 14px;
        font-weight: 600;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
      .song-artists {
        display: block;
        color: rgba(255, 255, 255, 0.5);
        font-size: 12px;
        margin-top: 2px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
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
        padding: 4px;
      }
      .like-btn.liked {
        color: #ef4444;
      }
      .artists-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 20px;
      }
      .artist-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        text-decoration: none;
        padding: 16px;
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.05);
        transition: all 0.2s;
      }
      .artist-card:hover {
        background: rgba(255, 255, 255, 0.06);
        border-color: var(--sn-cyan);
        transform: translateY(-4px);
      }
      .avatar-ring {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        padding: 3px;
        background: linear-gradient(135deg, var(--sn-violet), var(--sn-cyan));
        margin-bottom: 12px;
        overflow: hidden;
      }
      .avatar-img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
      }
      .artist-avatar {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: #11111e;
        color: #fff;
        display: grid;
        place-items: center;
        font-size: 24px;
        font-weight: 700;
      }
      .artist-name {
        color: #fff;
        font-size: 14px;
        font-weight: 600;
      }
      .artist-role {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.4);
        margin-top: 2px;
      }
      .workflow-banner {
        border-radius: 16px;
        padding: 32px;
        background: rgba(139, 92, 246, 0.12);
        border: 1px solid rgba(139, 92, 246, 0.25);
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 24px;
      }
      .wf-left h2 {
        font-size: 24px;
        margin: 0 0 8px;
        color: #fff;
      }
      .wf-left p {
        color: rgba(255, 255, 255, 0.65);
        margin: 0 0 16px;
        font-size: 14px;
      }
      .actor-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        max-width: 450px;
      }
      .chip {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 16px;
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: #fff;
        text-decoration: none;
        font-size: 13px;
        font-weight: 600;
        transition: all 0.2s;
      }
      .chip:hover {
        background: rgba(255, 255, 255, 0.15);
        border-color: var(--sn-cyan);
        transform: scale(1.04);
      }
      .star-icon {
        color: #f59e0b;
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
        border-color: rgba(255, 255, 255, 0.2);
        transform: translateY(-4px);
      }
      .album-art {
        width: 100%;
        aspect-ratio: 1;
        border-radius: 10px;
        background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(139, 92, 246, 0.2));
        display: grid;
        place-items: center;
        font-size: 36px;
        margin-bottom: 12px;
        position: relative;
        overflow: hidden;
      }
      .album-cover-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .type-tag {
        position: absolute;
        bottom: 8px;
        right: 8px;
        padding: 2px 8px;
        border-radius: 8px;
        background: rgba(0, 0, 0, 0.7);
        color: #fff;
        font-size: 10px;
        text-transform: uppercase;
        font-weight: 700;
      }
      .album-title {
        display: block;
        color: #fff;
        font-size: 14px;
        font-weight: 600;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
      .album-year {
        display: block;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.4);
        margin-top: 4px;
      }
      .pagination-badge {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.6);
        background: rgba(255, 255, 255, 0.06);
        padding: 5px 14px;
        border-radius: 14px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(8px);
      }
      .pagination-bar {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        margin-top: 24px;
        padding-top: 18px;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
      }
      .page-nav-btn {
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.12);
        color: #fff;
        padding: 8px 18px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .page-nav-btn:hover:not(:disabled) {
        background: rgba(6, 182, 212, 0.2);
        border-color: var(--sn-cyan);
        color: var(--sn-cyan);
        box-shadow: 0 0 12px rgba(6, 182, 212, 0.3);
      }
      .page-nav-btn:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }
      .page-pills {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .page-num-btn {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.8);
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .page-num-btn:hover:not(.active) {
        background: rgba(255, 255, 255, 0.12);
        color: #fff;
      }
      .page-num-btn.active {
        background: linear-gradient(135deg, var(--sn-cyan), var(--sn-purple));
        color: #fff;
        border-color: var(--sn-cyan);
        box-shadow: 0 0 14px rgba(6, 182, 212, 0.4);
      }
    `,
  ],
})
export class HomeComponent implements OnInit {
  private catalog = inject(CatalogService);
  player = inject(PlayerService);
  library = inject(LibraryService);

  feed = signal<HomeFeed | null>(null);

  // Pagination signals
  currentPage = signal<number>(1);
  pageSize = signal<number>(6);

  allSongs = computed(() => this.feed()?.trending_songs || []);
  totalSongs = computed(() => this.allSongs().length);
  totalPages = computed(() => Math.max(1, Math.ceil(this.totalSongs() / this.pageSize())));

  paginatedSongs = computed(() => {
    const list = this.allSongs();
    const start = (this.currentPage() - 1) * this.pageSize();
    return list.slice(start, start + this.pageSize());
  });

  pageNumbers = computed(() => {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  startIndex = computed(() => (this.totalSongs() === 0 ? 0 : (this.currentPage() - 1) * this.pageSize() + 1));
  endIndex = computed(() => Math.min(this.currentPage() * this.pageSize(), this.totalSongs()));

  ngOnInit(): void {
    this.catalog.getHomeFeed().subscribe((data) => this.feed.set(data));
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((p) => p - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((p) => p + 1);
    }
  }

  firstTrack(): Track | null {
    const list = this.feed()?.trending_songs;
    return list && list.length > 0 ? list[0] : null;
  }

  getArtistNames(song: Track): string {
    return song.artists?.map((a) => a.name).join(', ') || 'Various Artists';
  }

  playSong(song: Track): void {
    const songs = this.feed()?.trending_songs || [song];
    this.player.playTrack(song, songs);
  }

  toggleLike(event: Event, songId: number): void {
    event.stopPropagation();
    this.library.toggleFavorite(songId).subscribe();
  }
}
