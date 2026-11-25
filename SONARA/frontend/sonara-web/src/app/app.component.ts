import { Component, OnInit, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { PlayerService } from './core/services/player.service';
import { LibraryService } from './core/services/library.service';
import { SidebarComponent } from '../layout/sidebar/sidebar.component';
import { HeaderComponent } from '../layout/header/header.component';
import { MiniPlayerComponent } from '../layout/mini-player/mini-player.component';
import { FullPlayer3DComponent } from '../features/player/full-player-3d.component';

@Component({
  selector: 'sonara-root',
  standalone: true,
  imports: [
    RouterOutlet,
    SidebarComponent,
    HeaderComponent,
    MiniPlayerComponent,
    FullPlayer3DComponent,
  ],
  template: `
    @if (auth.isAuthenticated()) {
      <div class="app-shell" [class.has-player]="player.hasTrack()">
        <sonara-sidebar class="shell-sidebar"></sonara-sidebar>
        <div class="shell-content">
          <sonara-header></sonara-header>
          <main class="main-viewport">
            <router-outlet></router-outlet>
          </main>
        </div>
        <sonara-mini-player></sonara-mini-player>

        @if (player.isFullScreenVisualizer()) {
          <sonara-full-player-3d></sonara-full-player-3d>
        }
      </div>
    } @else {
      <router-outlet></router-outlet>
    }
  `,
  styles: [
    `
      .app-shell {
        display: flex;
        width: 100vw;
        height: 100vh;
        overflow: hidden;
        background: var(--sn-bg);
      }
      .shell-sidebar {
        flex-shrink: 0;
        height: 100%;
      }
      .shell-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
      }
      .main-viewport {
        flex: 1;
        overflow-y: auto;
        padding-bottom: 24px;
      }
      .has-player .main-viewport {
        padding-bottom: 96px;
      }
    `,
  ],
})
export class AppComponent implements OnInit {
  auth = inject(AuthService);
  player = inject(PlayerService);
  library = inject(LibraryService);

  constructor() {
    effect(() => {
      if (this.auth.isAuthenticated()) {
        this.library.loadFavorites().subscribe();
      }
    });
  }

  ngOnInit(): void {
    this.auth.restoreSession();
  }
}
