import { Component, inject } from '@angular/core';
import { PlayerService } from '../../app/core/services/player.service';
import { LibraryService } from '../../app/core/services/library.service';

@Component({
  selector: 'sonara-mini-player',
  standalone: true,
  template: `
    @if (player.hasTrack()) {
      <div class="player-bar">
        <!-- 1. Track Info -->
        <div class="track-info">
          <div class="artwork">
            @if (player.currentTrack()?.image_url) {
              <img [src]="player.currentTrack()?.image_url" alt="" class="art-img" />
            } @else {
              <span class="disc-icon">💿</span>
            }
          </div>
          <div class="meta">
            <span class="title">{{ player.currentTrack()?.title }}</span>
            <span class="artists">{{ artistNames() }}</span>
          </div>
          <button
            class="action-btn like-btn"
            [class.liked]="isFav()"
            (click)="toggleFav()"
            title="Like song"
          >
            ♥
          </button>
        </div>

        <!-- 2. Playback Controls & Progress Bar -->
        <div class="controls-center">
          <div class="buttons">
            <button
              class="action-btn"
              [class.active]="player.isShuffle()"
              (click)="player.toggleShuffle()"
              title="Shuffle"
            >
              ⤨
            </button>
            <button class="action-btn" (click)="player.prev()" title="Previous">
              ⏮
            </button>
            <button
              class="play-circle"
              (click)="player.togglePlay()"
              [title]="player.isPlaying() ? 'Pause' : 'Play'"
            >
              {{ player.isPlaying() ? '⏸' : '▶' }}
            </button>
            <button class="action-btn" (click)="player.next()" title="Next">
              ⏭
            </button>
            <button
              class="action-btn"
              [class.active]="player.isRepeat()"
              (click)="player.toggleRepeat()"
              title="Repeat"
            >
              ↻
            </button>
          </div>

          <div class="progress-wrap">
            <span class="time">{{ player.formatTime(player.currentTime()) }}</span>
            <div class="progress-bar" (click)="onSeek($event)">
              <div
                class="progress-fill"
                [style.width.%]="player.progressPercent()"
              ></div>
            </div>
            <span class="time">{{ player.formatTime(player.duration()) }}</span>
          </div>
        </div>

        <!-- 3. Volume & 3D Visualizer Trigger -->
        <div class="tools-right">
          <button class="action-btn" (click)="player.toggleMute()" title="Mute/Unmute">
            {{ player.isMuted() ? '🔇' : '🔊' }}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            [value]="player.isMuted() ? 0 : player.volume()"
            (input)="onVolumeChange($event)"
            class="vol-slider"
          />
          <button
            class="visualizer-toggle-btn"
            (click)="player.toggleFullScreen()"
            title="Open 3D Audio-Reactive Visualizer"
          >
            <span class="orbit-icon">🪐</span>
            <span class="btn-text">3D VISUALS</span>
          </button>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .player-bar {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 84px;
        background: rgba(10, 10, 18, 0.96);
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(28px);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 28px;
        z-index: 100;
        box-sizing: border-box;
      }
      .track-info {
        display: flex;
        align-items: center;
        gap: 14px;
        width: 280px;
      }
      .artwork {
        width: 52px;
        height: 52px;
        border-radius: 8px;
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(6, 182, 212, 0.3));
        border: 1px solid rgba(255, 255, 255, 0.15);
        display: grid;
        place-items: center;
        font-size: 24px;
        overflow: hidden;
      }
      .art-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .meta {
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .title {
        color: #fff;
        font-size: 14px;
        font-weight: 600;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
      .artists {
        color: rgba(255, 255, 255, 0.5);
        font-size: 12px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
      .action-btn {
        background: none;
        border: 0;
        color: rgba(255, 255, 255, 0.65);
        font-size: 16px;
        cursor: pointer;
        padding: 6px;
        border-radius: 6px;
        transition: all 0.2s;
      }
      .action-btn:hover {
        color: #fff;
      }
      .action-btn.active {
        color: var(--sn-cyan);
      }
      .like-btn.liked {
        color: #ef4444;
      }
      .controls-center {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        flex: 1;
        max-width: 600px;
      }
      .buttons {
        display: flex;
        align-items: center;
        gap: 18px;
      }
      .play-circle {
        width: 42px;
        height: 42px;
        border-radius: 50%;
        background: #fff;
        color: #000;
        border: 0;
        font-size: 16px;
        display: grid;
        place-items: center;
        cursor: pointer;
        transition: transform 0.15s ease, box-shadow 0.15s ease;
      }
      .play-circle:hover {
        transform: scale(1.08);
        box-shadow: 0 0 16px rgba(255, 255, 255, 0.6);
      }
      .progress-wrap {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
      }
      .time {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.45);
        font-variant-numeric: tabular-nums;
        min-width: 32px;
      }
      .progress-bar {
        flex: 1;
        height: 4px;
        border-radius: 2px;
        background: rgba(255, 255, 255, 0.15);
        cursor: pointer;
        position: relative;
      }
      .progress-bar:hover {
        height: 6px;
      }
      .progress-fill {
        height: 100%;
        border-radius: 2px;
        background: linear-gradient(90deg, var(--sn-violet), var(--sn-cyan));
        position: relative;
      }
      .tools-right {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 280px;
        justify-content: flex-end;
      }
      .vol-slider {
        width: 80px;
        height: 4px;
        accent-color: var(--sn-cyan);
        cursor: pointer;
      }
      .visualizer-toggle-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        border-radius: 20px;
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(6, 182, 212, 0.2));
        border: 1px solid rgba(6, 182, 212, 0.4);
        color: var(--sn-cyan);
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.05em;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .visualizer-toggle-btn:hover {
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.45), rgba(6, 182, 212, 0.4));
        box-shadow: 0 0 14px rgba(6, 182, 212, 0.4);
      }
      .orbit-icon {
        font-size: 14px;
      }
    `,
  ],
})
export class MiniPlayerComponent {
  player = inject(PlayerService);
  private library = inject(LibraryService);

  artistNames(): string {
    const artists = this.player.currentTrack()?.artists;
    return artists && artists.length > 0
      ? artists.map((a) => a.name).join(', ')
      : 'Unknown Artist';
  }

  isFav(): boolean {
    const track = this.player.currentTrack();
    return track ? this.library.isFavorite(track.id) : false;
  }

  toggleFav(): void {
    const track = this.player.currentTrack();
    if (track) {
      this.library.toggleFavorite(track.id).subscribe();
    }
  }

  onSeek(e: MouseEvent): void {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = (clickX / rect.width) * 100;
    this.player.seekPercent(percent);
  }

  onVolumeChange(e: Event): void {
    const val = parseFloat((e.target as HTMLInputElement).value);
    this.player.setVolume(val);
  }
}
