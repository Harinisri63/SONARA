import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LibraryService, PlaylistSummary } from '../../app/core/services/library.service';

@Component({
  selector: 'sonara-library',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="library-page">
      <header class="library-header">
        <div>
          <h1>Your Library</h1>
          <p class="subtitle">Custom playlists and saved collections</p>
        </div>
        <button class="create-btn" (click)="showCreateModal.set(true)">
          + New Playlist
        </button>
      </header>

      <!-- Favorites Card -->
      <a routerLink="/favorites" class="fav-banner">
        <div class="fav-icon">♥</div>
        <div class="fav-info">
          <h3>Liked Songs</h3>
          <p>Your starred tracks from discovery and artist pages</p>
        </div>
      </a>

      <!-- Playlists Grid -->
      <section class="playlists-section">
        <h2>Your Playlists</h2>
        @if (library.playlists().length === 0) {
          <div class="empty">
            <span class="empty-icon">📂</span>
            <p>No custom playlists yet. Create your first playlist to organize your tracks!</p>
          </div>
        } @else {
          <div class="playlists-grid">
            @for (pl of library.playlists(); track pl.id) {
              <div class="playlist-card">
                <div class="art">🎶</div>
                <span class="pl-name">{{ pl.name }}</span>
                <span class="pl-meta">{{ pl.song_count }} songs • {{ pl.is_public ? 'Public' : 'Private' }}</span>
              </div>
            }
          </div>
        }
      </section>

      <!-- Create Playlist Modal -->
      @if (showCreateModal()) {
        <div class="modal-bg" (click)="showCreateModal.set(false)">
          <div class="modal" (click)="$event.stopPropagation()">
            <h3>Create Playlist</h3>
            <input
              type="text"
              placeholder="Playlist name..."
              [(ngModel)]="newPlaylistName"
              (keydown.enter)="createPlaylist()"
            />
            <div class="modal-actions">
              <button class="cancel-btn" (click)="showCreateModal.set(false)">Cancel</button>
              <button class="save-btn" (click)="createPlaylist()" [disabled]="!newPlaylistName.trim()">
                Create
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .library-page {
        padding: 32px;
        display: flex;
        flex-direction: column;
        gap: 36px;
      }
      .library-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .library-header h1 {
        font-size: 32px;
        color: #fff;
        margin: 0 0 4px;
      }
      .subtitle {
        color: rgba(255, 255, 255, 0.55);
        font-size: 14px;
        margin: 0;
      }
      .create-btn {
        padding: 10px 20px;
        border-radius: 20px;
        background: linear-gradient(135deg, var(--sn-violet), var(--sn-cyan));
        color: #fff;
        border: 0;
        font-weight: 700;
        font-size: 13px;
        cursor: pointer;
        transition: transform 0.2s;
      }
      .create-btn:hover {
        transform: scale(1.05);
      }
      .fav-banner {
        display: flex;
        align-items: center;
        gap: 20px;
        padding: 24px;
        border-radius: 16px;
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(139, 92, 246, 0.2));
        border: 1px solid rgba(255, 255, 255, 0.1);
        text-decoration: none;
        transition: all 0.2s;
      }
      .fav-banner:hover {
        transform: translateY(-2px);
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(139, 92, 246, 0.3));
      }
      .fav-icon {
        width: 60px;
        height: 60px;
        border-radius: 12px;
        background: #ef4444;
        color: #fff;
        display: grid;
        place-items: center;
        font-size: 28px;
      }
      .fav-info h3 {
        color: #fff;
        font-size: 18px;
        margin: 0 0 4px;
      }
      .fav-info p {
        color: rgba(255, 255, 255, 0.6);
        font-size: 13px;
        margin: 0;
      }
      .playlists-section h2 {
        font-size: 20px;
        color: #fff;
        margin: 0 0 16px;
      }
      .playlists-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 20px;
      }
      .playlist-card {
        padding: 16px;
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.06);
        transition: all 0.2s;
      }
      .playlist-card:hover {
        background: rgba(255, 255, 255, 0.07);
        border-color: var(--sn-cyan);
      }
      .art {
        width: 100%;
        aspect-ratio: 1;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.05);
        display: grid;
        place-items: center;
        font-size: 36px;
        margin-bottom: 12px;
      }
      .pl-name {
        display: block;
        color: #fff;
        font-size: 15px;
        font-weight: 600;
      }
      .pl-meta {
        display: block;
        color: rgba(255, 255, 255, 0.4);
        font-size: 12px;
        margin-top: 4px;
      }
      .empty {
        text-align: center;
        padding: 40px;
        color: rgba(255, 255, 255, 0.4);
      }
      .empty-icon {
        font-size: 40px;
      }
      .modal-bg {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(8px);
        display: grid;
        place-items: center;
        z-index: 300;
      }
      .modal {
        background: #12121e;
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 18px;
        padding: 28px;
        width: 100%;
        max-width: 380px;
      }
      .modal h3 {
        margin: 0 0 16px;
        color: #fff;
      }
      .modal input {
        width: 100%;
        padding: 12px 14px;
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.15);
        background: rgba(0, 0, 0, 0.4);
        color: #fff;
        font-size: 14px;
        box-sizing: border-box;
        margin-bottom: 20px;
      }
      .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
      }
      .cancel-btn {
        background: none;
        border: 0;
        color: rgba(255, 255, 255, 0.6);
        cursor: pointer;
        font-weight: 600;
      }
      .save-btn {
        padding: 8px 18px;
        border-radius: 10px;
        background: var(--sn-cyan);
        color: #000;
        border: 0;
        font-weight: 700;
        cursor: pointer;
      }
      .save-btn[disabled] {
        opacity: 0.5;
        cursor: not-allowed;
      }
    `,
  ],
})
export class LibraryComponent implements OnInit {
  library = inject(LibraryService);

  showCreateModal = signal(false);
  newPlaylistName = '';

  ngOnInit(): void {
    this.library.getPlaylists().subscribe();
  }

  createPlaylist(): void {
    if (!this.newPlaylistName.trim()) return;
    this.library.createPlaylist(this.newPlaylistName.trim()).subscribe(() => {
      this.newPlaylistName = '';
      this.showCreateModal.set(false);
    });
  }
}
