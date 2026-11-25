import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AdminService,
  AdminStats,
  CatalogOverview,
  CatalogSongItem,
  CatalogArtistItem,
  CatalogActorItem,
  CatalogMovieItem,
  CatalogAlbumItem,
  CatalogPlaylistItem
} from '../../app/core/services/admin.service';
import { AuthService } from '../../app/core/services/auth.service';

type AdminTab = 'overview' | 'songs' | 'artists' | 'actors' | 'movies' | 'albums' | 'playlists';

@Component({
  selector: 'sonara-admin',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="admin-container">
      <!-- 1. Header -->
      <header class="admin-header">
        <div>
          <span class="badge">STUDIO CONTROL BACKSTAGE</span>
          <h1>Admin Management Console</h1>
          <p class="subtitle">
            Full catalog proficiency: Add, Edit, Delete songs, artists, actors, movies, soundtrack albums & curated playlists with real online media.
          </p>
        </div>
        <div class="admin-user-pill">
          <span class="shield">🛡️</span>
          <span>Logged in as <strong>{{ auth.user()?.username }}</strong> (Master Admin)</span>
        </div>
      </header>

      <!-- 2. Navigation Tabs -->
      <nav class="admin-tabs">
        <button [class.active]="tab() === 'overview'" (click)="setTab('overview')">📊 Overview & Stats</button>
        <button [class.active]="tab() === 'songs'" (click)="setTab('songs')">🎵 Songs ({{ overview()?.songs?.length || 0 }})</button>
        <button [class.active]="tab() === 'artists'" (click)="setTab('artists')">♪ Artists ({{ overview()?.artists?.length || 0 }})</button>
        <button [class.active]="tab() === 'actors'" (click)="setTab('actors')">★ Actors ({{ overview()?.actors?.length || 0 }})</button>
        <button [class.active]="tab() === 'movies'" (click)="setTab('movies')">🎬 Movies ({{ overview()?.movies?.length || 0 }})</button>
        <button [class.active]="tab() === 'albums'" (click)="setTab('albums')">💿 Albums ({{ overview()?.albums?.length || 0 }})</button>
        <button [class.active]="tab() === 'playlists'" (click)="setTab('playlists')">📑 Playlists ({{ overview()?.playlists?.length || 0 }})</button>
      </nav>

      <!-- Notification Alerts -->
      @if (successMsg()) {
        <div class="banner success">
          <span>✓ {{ successMsg() }}</span>
          <button class="close-btn" (click)="successMsg.set('')">✕</button>
        </div>
      }
      @if (errorMsg()) {
        <div class="banner error">
          <span>⚠ {{ errorMsg() }}</span>
          <button class="close-btn" (click)="errorMsg.set('')">✕</button>
        </div>
      }

      <!-- ==================== TAB 1: OVERVIEW & STATS ==================== -->
      @if (tab() === 'overview') {
        <section class="tab-content">
          <div class="kpi-grid">
            <div class="kpi-card" (click)="setTab('songs')">
              <span class="icon">🎵</span>
              <span class="metric">{{ stats()?.total_songs || 0 }}</span>
              <span class="label">Total Songs</span>
              <span class="kpi-link">Manage Songs ➔</span>
            </div>
            <div class="kpi-card" (click)="setTab('artists')">
              <span class="icon">♪</span>
              <span class="metric">{{ stats()?.total_artists || 0 }}</span>
              <span class="label">Artists & Composers</span>
              <span class="kpi-link">Manage Artists ➔</span>
            </div>
            <div class="kpi-card" (click)="setTab('actors')">
              <span class="icon">★</span>
              <span class="metric">{{ stats()?.total_actors || 0 }}</span>
              <span class="label">Film Actors</span>
              <span class="kpi-link">Manage Actors ➔</span>
            </div>
            <div class="kpi-card" (click)="setTab('movies')">
              <span class="icon">🎬</span>
              <span class="metric">{{ stats()?.total_movies || 0 }}</span>
              <span class="label">Soundtrack Movies</span>
              <span class="kpi-link">Manage Movies ➔</span>
            </div>
            <div class="kpi-card" (click)="setTab('albums')">
              <span class="icon">💿</span>
              <span class="metric">{{ stats()?.total_albums || 0 }}</span>
              <span class="label">Total Albums</span>
              <span class="kpi-link">Manage Albums ➔</span>
            </div>
            <div class="kpi-card" (click)="setTab('playlists')">
              <span class="icon">📑</span>
              <span class="metric">{{ stats()?.total_playlists || 0 }}</span>
              <span class="label">Curated Playlists</span>
              <span class="kpi-link">Manage Playlists ➔</span>
            </div>
            <div class="kpi-card highlight">
              <span class="icon">⚡</span>
              <span class="metric">{{ stats()?.total_plays?.toLocaleString() || 0 }}</span>
              <span class="label">Total Ecosystem Plays</span>
              <span class="kpi-link">Real-time Audio Streams</span>
            </div>
          </div>
        </section>
      }

      <!-- ==================== TAB 2: SONGS MANAGEMENT ==================== -->
      @if (tab() === 'songs') {
        <section class="tab-content">
          <div class="panel-layout">
            <!-- Form Card (Add / Edit) -->
            <div class="form-card">
              <div class="form-header">
                <h3>{{ editingSongId() ? '✏️ Edit Song #' + editingSongId() : '+ Add New Song' }}</h3>
                @if (editingSongId()) {
                  <button type="button" class="cancel-edit-btn" (click)="cancelSongEdit()">Cancel Edit</button>
                }
              </div>
              <form (ngSubmit)="submitSong()">
                <label>Song Title *</label>
                <input type="text" [(ngModel)]="songForm.title" name="songTitle" placeholder="e.g. Badass" required />

                <label>Album / Soundtrack</label>
                <select [(ngModel)]="songForm.album_id" name="songAlbum">
                  <option [ngValue]="null">-- Standalone / No Album --</option>
                  <option [ngValue]="-1">✨ + Custom / New Album...</option>
                  @for (alb of overview()?.albums; track alb.id) {
                    <option [ngValue]="alb.id">{{ alb.title }} ({{ alb.year }})</option>
                  }
                </select>
                @if (songForm.album_id === -1) {
                  <input
                    type="text"
                    [(ngModel)]="songForm.custom_album_title"
                    name="songCustomAlbum"
                    placeholder="Enter custom album title (e.g. Leo Original Soundtrack)"
                    style="margin-top: 8px; border-color: var(--sn-cyan);"
                    required
                  />
                }

                <label>Artists / Composers</label>
                <select multiple [(ngModel)]="songForm.artist_ids" name="songArtists" class="multi-select">
                  @for (art of overview()?.artists; track art.id) {
                    <option [ngValue]="art.id">{{ art.name }}</option>
                  }
                </select>
                <span class="field-hint">Hold Ctrl / Cmd to select existing artists</span>

                <div style="margin-top: 10px;">
                  <label style="font-size: 12px; color: var(--sn-cyan);">✨ Or Add Custom Artist(s):</label>
                  <input
                    type="text"
                    [(ngModel)]="songForm.custom_artist_names"
                    name="songCustomArtists"
                    placeholder="e.g. Taylor Swift, Alan Walker (comma-separated)"
                    style="margin-top: 4px;"
                  />
                  <span class="field-hint">Automatically registers new artists to the ecosystem catalog</span>
                </div>

                <div class="row">
                  <div class="col">
                    <label>Duration (Seconds)</label>
                    <input type="number" [(ngModel)]="songForm.duration_seconds" name="songDuration" />
                  </div>
                  <div class="col">
                    <label>Mood / Energy</label>
                    <input type="text" [(ngModel)]="songForm.mood" name="songMood" placeholder="e.g. Explosive, Melody" />
                  </div>
                </div>

                <label>Online Audio Stream URL (CDN / MP3 / YouTube)</label>
                <input
                  type="text"
                  [(ngModel)]="songForm.audio_url"
                  name="songAudioUrl"
                  placeholder="e.g. https://www.youtube.com/watch?v=... or direct MP3"
                />
                <span class="field-hint">Supports YouTube links or direct MP3 streams; automatically converted & streamed seamlessly</span>

                <label>Cover Art / Image URL</label>
                <input
                  type="text"
                  [(ngModel)]="songForm.image_url"
                  name="songImageUrl"
                  placeholder="https://images.unsplash.com/photo-..."
                />

                <div class="checkbox-row">
                  <label>
                    <input type="checkbox" [(ngModel)]="songForm.is_published" name="songPublished" />
                    Publish Immediately
                  </label>
                </div>

                <button type="submit" class="submit-btn" [disabled]="!songForm.title.trim()">
                  {{ editingSongId() ? 'Save Song Changes' : 'Publish New Song' }}
                </button>
              </form>
            </div>

            <!-- Existing Songs Table -->
            <div class="table-card">
              <h3>Catalog Songs ({{ overview()?.songs?.length || 0 }})</h3>
              <div class="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Cover</th>
                      <th>Title</th>
                      <th>Duration</th>
                      <th>Plays</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (s of overview()?.songs; track s.id) {
                      <tr>
                        <td>
                          <div class="table-thumb">
                            @if (s.image_url) {
                              <img [src]="s.image_url" alt="" />
                            } @else {
                              <span>💿</span>
                            }
                          </div>
                        </td>
                        <td>
                          <strong>{{ s.title }}</strong>
                          @if (s.mood) {
                            <span class="sub-chip">{{ s.mood }}</span>
                          }
                        </td>
                        <td>{{ formatDuration(s.duration) }}</td>
                        <td>{{ s.plays ? s.plays.toLocaleString() : 0 }}</td>
                        <td>
                          <div class="action-buttons">
                            <button class="edit-btn" (click)="editSong(s)" title="Edit Song">✏️</button>
                            <button class="delete-btn" (click)="deleteSong(s.id)" title="Delete Song">🗑️</button>
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      }

      <!-- ==================== TAB 3: ARTISTS MANAGEMENT ==================== -->
      @if (tab() === 'artists') {
        <section class="tab-content">
          <div class="panel-layout">
            <!-- Form Card -->
            <div class="form-card">
              <div class="form-header">
                <h3>{{ editingArtistId() ? '✏️ Edit Artist #' + editingArtistId() : '+ Add Composer / Artist' }}</h3>
                @if (editingArtistId()) {
                  <button type="button" class="cancel-edit-btn" (click)="cancelArtistEdit()">Cancel Edit</button>
                }
              </div>
              <form (ngSubmit)="submitArtist()">
                <label>Artist Name *</label>
                <input type="text" [(ngModel)]="artistForm.name" name="artistName" placeholder="e.g. Harris Jayaraj" required />

                <label>Biography</label>
                <textarea rows="3" [(ngModel)]="artistForm.bio" name="artistBio" placeholder="Artist biography & notable works..."></textarea>

                <label>Country / Origin</label>
                <input type="text" [(ngModel)]="artistForm.country" name="artistCountry" placeholder="e.g. India" />

                <label>Online Image URL (Portrait)</label>
                <input
                  type="text"
                  [(ngModel)]="artistForm.image_url"
                  name="artistImg"
                  placeholder="https://images.unsplash.com/photo-..."
                />

                <div class="checkbox-row">
                  <label>
                    <input type="checkbox" [(ngModel)]="artistForm.is_featured" name="artFeatured" />
                    Feature on Home Discovery
                  </label>
                </div>

                <button type="submit" class="submit-btn" [disabled]="!artistForm.name.trim()">
                  {{ editingArtistId() ? 'Save Artist Changes' : 'Add Artist' }}
                </button>
              </form>
            </div>

            <!-- Existing Artists Table -->
            <div class="table-card">
              <h3>Catalog Artists ({{ overview()?.artists?.length || 0 }})</h3>
              <div class="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Photo</th>
                      <th>Name</th>
                      <th>Origin</th>
                      <th>Featured</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (a of overview()?.artists; track a.id) {
                      <tr>
                        <td>
                          <div class="table-thumb circle">
                            @if (a.image_url) {
                              <img [src]="a.image_url" alt="" />
                            } @else {
                              <span>{{ a.name.charAt(0) }}</span>
                            }
                          </div>
                        </td>
                        <td><strong>{{ a.name }}</strong></td>
                        <td>{{ a.country || 'International' }}</td>
                        <td>{{ a.is_featured ? '⭐ Yes' : 'No' }}</td>
                        <td>
                          <div class="action-buttons">
                            <button class="edit-btn" (click)="editArtist(a)" title="Edit Artist">✏️</button>
                            <button class="delete-btn" (click)="deleteArtist(a.id)" title="Delete Artist">🗑️</button>
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      }

      <!-- ==================== TAB 4: ACTORS MANAGEMENT ==================== -->
      @if (tab() === 'actors') {
        <section class="tab-content">
          <div class="panel-layout">
            <!-- Form Card -->
            <div class="form-card">
              <div class="form-header">
                <h3>{{ editingActorId() ? '✏️ Edit Actor #' + editingActorId() : '+ Add Film Star / Actor' }}</h3>
                @if (editingActorId()) {
                  <button type="button" class="cancel-edit-btn" (click)="cancelActorEdit()">Cancel Edit</button>
                }
              </div>
              <form (ngSubmit)="submitActor()">
                <label>Actor Name *</label>
                <input type="text" [(ngModel)]="actorForm.name" name="actorName" placeholder="e.g. Suriya" required />

                <label>Biography & Career Highlights</label>
                <textarea rows="3" [(ngModel)]="actorForm.bio" name="actorBio" placeholder="Actor biography..."></textarea>

                <label>Online Image URL (Headshot / Portrait)</label>
                <input
                  type="text"
                  [(ngModel)]="actorForm.image_url"
                  name="actorImg"
                  placeholder="https://images.unsplash.com/photo-..."
                />

                <div class="checkbox-row">
                  <label>
                    <input type="checkbox" [(ngModel)]="actorForm.is_featured" name="actFeatured" />
                    Feature in Cinematic Workflow
                  </label>
                </div>

                <button type="submit" class="submit-btn" [disabled]="!actorForm.name.trim()">
                  {{ editingActorId() ? 'Save Actor Changes' : 'Add Actor' }}
                </button>
              </form>
            </div>

            <!-- Existing Actors Table -->
            <div class="table-card">
              <h3>Film Stars & Actors ({{ overview()?.actors?.length || 0 }})</h3>
              <div class="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Photo</th>
                      <th>Name</th>
                      <th>Featured</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (act of overview()?.actors; track act.id) {
                      <tr>
                        <td>
                          <div class="table-thumb circle">
                            @if (act.image_url) {
                              <img [src]="act.image_url" alt="" />
                            } @else {
                              <span>{{ act.name.charAt(0) }}</span>
                            }
                          </div>
                        </td>
                        <td><strong>{{ act.name }}</strong></td>
                        <td>{{ act.is_featured ? '⭐ Yes' : 'No' }}</td>
                        <td>
                          <div class="action-buttons">
                            <button class="edit-btn" (click)="editActor(act)" title="Edit Actor">✏️</button>
                            <button class="delete-btn" (click)="deleteActor(act.id)" title="Delete Actor">🗑️</button>
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      }

      <!-- ==================== TAB 5: MOVIES MANAGEMENT ==================== -->
      @if (tab() === 'movies') {
        <section class="tab-content">
          <div class="panel-layout">
            <!-- Form Card -->
            <div class="form-card">
              <div class="form-header">
                <h3>{{ editingMovieId() ? '✏️ Edit Movie #' + editingMovieId() : '+ Add Movie & Soundtrack' }}</h3>
                @if (editingMovieId()) {
                  <button type="button" class="cancel-edit-btn" (click)="cancelMovieEdit()">Cancel Edit</button>
                }
              </div>
              <form (ngSubmit)="submitMovie()">
                <label>Movie Title *</label>
                <input type="text" [(ngModel)]="movieForm.title" name="movieTitle" placeholder="e.g. Leo" required />

                <div class="row">
                  <div class="col">
                    <label>Release Year</label>
                    <input type="number" [(ngModel)]="movieForm.release_year" name="movieYear" />
                  </div>
                  <div class="col">
                    <label>Director</label>
                    <input type="text" [(ngModel)]="movieForm.director" name="movieDir" placeholder="e.g. Lokesh Kanagaraj" />
                  </div>
                </div>

                <label>Music Composer</label>
                <select [(ngModel)]="movieForm.composer_artist_id" name="movieComposer">
                  <option [ngValue]="null">-- Select Music Director --</option>
                  @for (art of overview()?.artists; track art.id) {
                    <option [ngValue]="art.id">{{ art.name }}</option>
                  }
                </select>

                <div class="row">
                  <div class="col">
                    <label>Lead Star Actor</label>
                    <select [(ngModel)]="movieForm.lead_actor_id" name="movieLead">
                      <option [ngValue]="null">-- Select Lead Actor --</option>
                      @for (act of overview()?.actors; track act.id) {
                        <option [ngValue]="act.id">{{ act.name }}</option>
                      }
                    </select>
                  </div>
                  <div class="col">
                    <label>Character Name</label>
                    <input type="text" [(ngModel)]="movieForm.character_name" name="charName" placeholder="e.g. Leo Das" />
                  </div>
                </div>

                <label>Online Poster URL</label>
                <input
                  type="text"
                  [(ngModel)]="movieForm.poster_url"
                  name="moviePoster"
                  placeholder="https://images.unsplash.com/photo-..."
                />

                <button type="submit" class="submit-btn" [disabled]="!movieForm.title.trim()">
                  {{ editingMovieId() ? 'Save Movie Changes' : 'Create Movie & Link' }}
                </button>
              </form>
            </div>

            <!-- Existing Movies Table -->
            <div class="table-card">
              <h3>Movies & Soundtracks ({{ overview()?.movies?.length || 0 }})</h3>
              <div class="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Poster</th>
                      <th>Title</th>
                      <th>Year</th>
                      <th>Director</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (m of overview()?.movies; track m.id) {
                      <tr>
                        <td>
                          <div class="table-thumb">
                            @if (m.poster_url) {
                              <img [src]="m.poster_url" alt="" />
                            } @else {
                              <span>🎬</span>
                            }
                          </div>
                        </td>
                        <td><strong>{{ m.title }}</strong></td>
                        <td>{{ m.year || '-' }}</td>
                        <td>{{ m.director || '-' }}</td>
                        <td>
                          <div class="action-buttons">
                            <button class="edit-btn" (click)="editMovie(m)" title="Edit Movie">✏️</button>
                            <button class="delete-btn" (click)="deleteMovie(m.id)" title="Delete Movie">🗑️</button>
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      }

      <!-- ==================== TAB 6: ALBUMS MANAGEMENT ==================== -->
      @if (tab() === 'albums') {
        <section class="tab-content">
          <div class="panel-layout">
            <!-- Form Card -->
            <div class="form-card">
              <div class="form-header">
                <h3>{{ editingAlbumId() ? '✏️ Edit Album #' + editingAlbumId() : '+ Add Album / Soundtrack' }}</h3>
                @if (editingAlbumId()) {
                  <button type="button" class="cancel-edit-btn" (click)="cancelAlbumEdit()">Cancel Edit</button>
                }
              </div>
              <form (ngSubmit)="submitAlbum()">
                <label>Album Title *</label>
                <input type="text" [(ngModel)]="albumForm.title" name="albumTitle" placeholder="e.g. Master (Soundtrack)" required />

                <div class="row">
                  <div class="col">
                    <label>Release Year</label>
                    <input type="number" [(ngModel)]="albumForm.release_year" name="albumYear" />
                  </div>
                  <div class="col">
                    <label>Album Type</label>
                    <select [(ngModel)]="albumForm.album_type" name="albumType">
                      <option value="soundtrack">Soundtrack</option>
                      <option value="album">Studio Album</option>
                      <option value="single">Single</option>
                      <option value="ep">EP</option>
                    </select>
                  </div>
                </div>

                <label>Associated Movie (if Soundtrack)</label>
                <select [(ngModel)]="albumForm.movie_id" name="albumMovie">
                  <option [ngValue]="null">-- None (Independent Album) --</option>
                  @for (m of overview()?.movies; track m.id) {
                    <option [ngValue]="m.id">{{ m.title }} ({{ m.year }})</option>
                  }
                </select>

                <label>Primary Music Composer / Artist</label>
                <select [(ngModel)]="albumForm.primary_artist_id" name="albumArtist">
                  <option [ngValue]="null">-- Select Artist --</option>
                  @for (art of overview()?.artists; track art.id) {
                    <option [ngValue]="art.id">{{ art.name }}</option>
                  }
                </select>

                <label>Cover Art URL</label>
                <input
                  type="text"
                  [(ngModel)]="albumForm.cover_url"
                  name="albumCover"
                  placeholder="https://images.unsplash.com/photo-..."
                />

                <button type="submit" class="submit-btn" [disabled]="!albumForm.title.trim()">
                  {{ editingAlbumId() ? 'Save Album Changes' : 'Create Album' }}
                </button>
              </form>
            </div>

            <!-- Existing Albums Table -->
            <div class="table-card">
              <h3>Ecosystem Albums ({{ overview()?.albums?.length || 0 }})</h3>
              <div class="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Cover</th>
                      <th>Title</th>
                      <th>Year</th>
                      <th>Type</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (alb of overview()?.albums; track alb.id) {
                      <tr>
                        <td>
                          <div class="table-thumb">
                            @if (alb.cover_url) {
                              <img [src]="alb.cover_url" alt="" />
                            } @else {
                              <span>💿</span>
                            }
                          </div>
                        </td>
                        <td><strong>{{ alb.title }}</strong></td>
                        <td>{{ alb.year || '-' }}</td>
                        <td><span class="sub-chip">{{ alb.type }}</span></td>
                        <td>
                          <div class="action-buttons">
                            <button class="edit-btn" (click)="editAlbum(alb)" title="Edit Album">✏️</button>
                            <button class="delete-btn" (click)="deleteAlbum(alb.id)" title="Delete Album">🗑️</button>
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      }

      <!-- ==================== TAB 7: PLAYLISTS MANAGEMENT ==================== -->
      @if (tab() === 'playlists') {
        <section class="tab-content">
          <div class="panel-layout">
            <!-- Form Card -->
            <div class="form-card">
              <div class="form-header">
                <h3>{{ editingPlaylistId() ? '✏️ Edit Playlist #' + editingPlaylistId() : '+ Curate Official Playlist' }}</h3>
                @if (editingPlaylistId()) {
                  <button type="button" class="cancel-edit-btn" (click)="cancelPlaylistEdit()">Cancel Edit</button>
                }
              </div>
              <form (ngSubmit)="submitPlaylist()">
                <label>Playlist Name *</label>
                <input type="text" [(ngModel)]="playlistForm.name" name="plName" placeholder="e.g. Anirudh High-Energy Anthems" required />

                <label>Description</label>
                <textarea rows="3" [(ngModel)]="playlistForm.description" name="plDesc" placeholder="Playlist description..."></textarea>

                <label>Select Songs to Include</label>
                <select multiple [(ngModel)]="playlistForm.song_ids" name="plSongs" class="multi-select">
                  @for (s of overview()?.songs; track s.id) {
                    <option [ngValue]="s.id">{{ s.title }}</option>
                  }
                </select>
                <span class="field-hint">Hold Ctrl / Cmd to select tracks</span>

                <div class="checkbox-row">
                  <label>
                    <input type="checkbox" [(ngModel)]="playlistForm.is_public" name="plPublic" />
                    Publish as Official Ecosystem Playlist
                  </label>
                </div>

                <button type="submit" class="submit-btn" [disabled]="!playlistForm.name.trim()">
                  {{ editingPlaylistId() ? 'Save Playlist Changes' : 'Publish Playlist' }}
                </button>
              </form>
            </div>

            <!-- Existing Playlists Table -->
            <div class="table-card">
              <h3>Curated Playlists ({{ overview()?.playlists?.length || 0 }})</h3>
              <div class="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Public</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (p of overview()?.playlists; track p.id) {
                      <tr>
                        <td><strong>{{ p.name }}</strong></td>
                        <td>{{ p.description || '-' }}</td>
                        <td>{{ p.is_public ? '🌐 Yes' : '🔒 Private' }}</td>
                        <td>
                          <div class="action-buttons">
                            <button class="edit-btn" (click)="editPlaylist(p)" title="Edit Playlist">✏️</button>
                            <button class="delete-btn" (click)="deletePlaylist(p.id)" title="Delete Playlist">🗑️</button>
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      }

      <!-- Custom Confirmation Modal Dialog -->
      @if (confirmModal(); as modal) {
        <div class="modal-backdrop" (click)="cancelConfirm()">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <div class="modal-icon-wrap">
              <span class="modal-icon">⚠️</span>
            </div>
            <h3 class="modal-title">{{ modal.title }}</h3>
            <p class="modal-message">{{ modal.message }}</p>
            <div class="modal-actions">
              <button type="button" class="modal-btn-cancel" (click)="cancelConfirm()">Cancel</button>
              <button type="button" class="modal-btn-danger" (click)="executeConfirm()">Delete</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .admin-container {
        padding: 32px;
        display: flex;
        flex-direction: column;
        gap: 28px;
        color: #fff;
        max-width: 1400px;
        margin: 0 auto;
      }
      .admin-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 24px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }
      .admin-header h1 {
        font-size: 32px;
        margin: 8px 0;
        background: linear-gradient(135deg, #fff, var(--sn-cyan));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
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
      .subtitle {
        color: rgba(255, 255, 255, 0.6);
        font-size: 14px;
        margin: 0;
      }
      .admin-user-pill {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 20px;
        font-size: 13px;
      }

      /* Tabs */
      .admin-tabs {
        display: flex;
        gap: 8px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding-bottom: 12px;
        overflow-x: auto;
      }
      .admin-tabs button {
        padding: 10px 18px;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.06);
        color: rgba(255, 255, 255, 0.7);
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;
      }
      .admin-tabs button:hover {
        background: rgba(255, 255, 255, 0.08);
        color: #fff;
      }
      .admin-tabs button.active {
        background: var(--sn-cyan);
        color: #000;
        border-color: var(--sn-cyan);
        box-shadow: 0 0 16px rgba(6, 182, 212, 0.4);
      }

      /* Banner */
      .banner {
        padding: 12px 18px;
        border-radius: 10px;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .banner.success {
        background: rgba(16, 185, 129, 0.15);
        border: 1px solid rgba(16, 185, 129, 0.4);
        color: #10b981;
      }
      .banner.error {
        background: rgba(239, 68, 68, 0.15);
        border: 1px solid rgba(239, 68, 68, 0.4);
        color: #ef4444;
      }
      .close-btn {
        background: none;
        border: 0;
        color: inherit;
        font-size: 16px;
        cursor: pointer;
      }

      /* KPI Grid */
      .kpi-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 18px;
      }
      .kpi-card {
        padding: 24px;
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
        cursor: pointer;
        transition: all 0.2s;
      }
      .kpi-card:hover {
        background: rgba(255, 255, 255, 0.07);
        border-color: var(--sn-cyan);
        transform: translateY(-3px);
      }
      .kpi-card.highlight {
        background: linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(139, 92, 246, 0.15));
        border-color: rgba(6, 182, 212, 0.4);
      }
      .kpi-card .icon {
        font-size: 28px;
      }
      .kpi-card .metric {
        font-size: 32px;
        font-weight: 800;
        color: #fff;
      }
      .kpi-card .label {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.5);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .kpi-link {
        font-size: 11px;
        color: var(--sn-cyan);
        margin-top: 6px;
      }

      /* Panel Layout */
      .panel-layout {
        display: grid;
        grid-template-columns: 420px 1fr;
        gap: 28px;
        align-items: start;
      }
      @media (max-width: 1024px) {
        .panel-layout {
          grid-template-columns: 1fr;
        }
      }

      /* Form Card */
      .form-card {
        padding: 24px;
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
      }
      .form-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
      }
      .form-header h3 {
        margin: 0;
        font-size: 18px;
        color: #fff;
      }
      .cancel-edit-btn {
        padding: 4px 10px;
        border-radius: 8px;
        background: rgba(239, 68, 68, 0.2);
        border: 1px solid rgba(239, 68, 68, 0.4);
        color: #ef4444;
        font-size: 12px;
        cursor: pointer;
      }
      form {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      label {
        font-size: 12px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.8);
        text-transform: uppercase;
        letter-spacing: 0.04em;
        margin-bottom: -6px;
      }
      input[type='text'],
      input[type='number'],
      select,
      textarea {
        padding: 10px 14px;
        border-radius: 10px;
        background: rgba(0, 0, 0, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.12);
        color: #fff;
        font-size: 14px;
        outline: none;
        transition: border 0.2s;
        box-sizing: border-box;
        width: 100%;
      }
      input:focus,
      select:focus,
      textarea:focus {
        border-color: var(--sn-cyan);
      }
      .multi-select {
        height: 110px;
      }
      .field-hint {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.4);
        margin-top: -8px;
      }
      .row {
        display: flex;
        gap: 12px;
      }
      .col {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .checkbox-row {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: rgba(255, 255, 255, 0.9);
      }
      .submit-btn {
        padding: 12px;
        border-radius: 12px;
        background: linear-gradient(135deg, var(--sn-cyan), var(--sn-violet));
        border: 0;
        color: #fff;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        transition: opacity 0.2s;
        margin-top: 8px;
      }
      .submit-btn:hover:not(:disabled) {
        opacity: 0.9;
      }
      .submit-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      /* Table Card */
      .table-card {
        padding: 24px;
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
      }
      .table-card h3 {
        margin: 0 0 16px;
        font-size: 18px;
      }
      .table-wrapper {
        overflow-x: auto;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
      }
      th {
        text-align: left;
        padding: 10px 14px;
        color: rgba(255, 255, 255, 0.5);
        font-weight: 600;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }
      td {
        padding: 12px 14px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        vertical-align: middle;
      }
      tr:hover td {
        background: rgba(255, 255, 255, 0.02);
      }
      .table-thumb {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.06);
        display: grid;
        place-items: center;
        overflow: hidden;
      }
      .table-thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .table-thumb.circle {
        border-radius: 50%;
      }
      .sub-chip {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.06);
        font-size: 11px;
        color: var(--sn-cyan);
        margin-left: 8px;
      }
      .action-buttons {
        display: flex;
        gap: 6px;
      }
      .edit-btn,
      .delete-btn {
        padding: 6px 10px;
        border-radius: 6px;
        border: 0;
        cursor: pointer;
        font-size: 13px;
        transition: transform 0.15s;
      }
      .edit-btn {
        background: rgba(6, 182, 212, 0.2);
        color: var(--sn-cyan);
      }
      .edit-btn:hover {
        transform: scale(1.1);
      }
      .delete-btn {
        background: rgba(239, 68, 68, 0.2);
        color: #ef4444;
      }
      .delete-btn:hover {
        transform: scale(1.1);
      }

      /* Modal Styles */
      .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.78);
        backdrop-filter: blur(10px);
        display: grid;
        place-items: center;
        z-index: 1000;
        animation: modalFadeIn 0.2s ease;
      }
      .modal-card {
        width: 90%;
        max-width: 440px;
        background: #141420;
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 20px;
        padding: 28px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 35px rgba(239, 68, 68, 0.25);
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        animation: modalScaleUp 0.2s ease;
      }
      .modal-icon-wrap {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: rgba(239, 68, 68, 0.15);
        border: 1px solid rgba(239, 68, 68, 0.35);
        display: grid;
        place-items: center;
        font-size: 28px;
      }
      .modal-title {
        font-size: 22px;
        font-weight: 700;
        color: #fff;
        margin: 4px 0 0;
      }
      .modal-message {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.7);
        line-height: 1.5;
        margin: 0;
      }
      .modal-actions {
        display: flex;
        gap: 12px;
        width: 100%;
        margin-top: 14px;
      }
      .modal-btn-cancel {
        flex: 1;
        padding: 12px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.12);
        color: #fff;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }
      .modal-btn-cancel:hover {
        background: rgba(255, 255, 255, 0.15);
      }
      .modal-btn-danger {
        flex: 1;
        padding: 12px;
        border-radius: 12px;
        background: linear-gradient(135deg, #ef4444, #dc2626);
        border: 0;
        color: #fff;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 4px 16px rgba(239, 68, 68, 0.4);
      }
      .modal-btn-danger:hover {
        background: linear-gradient(135deg, #dc2626, #b91c1c);
        transform: translateY(-1px);
      }
      @keyframes modalFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes modalScaleUp {
        from { transform: scale(0.92); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
    `,
  ],
})
export class AdminComponent implements OnInit {
  private adminService = inject(AdminService);
  auth = inject(AuthService);

  tab = signal<AdminTab>('overview');
  stats = signal<AdminStats | null>(null);
  overview = signal<CatalogOverview | null>(null);

  successMsg = signal<string>('');
  errorMsg = signal<string>('');

  // Editing State Trackers
  editingSongId = signal<number | null>(null);
  editingArtistId = signal<number | null>(null);
  editingActorId = signal<number | null>(null);
  editingMovieId = signal<number | null>(null);
  editingAlbumId = signal<number | null>(null);
  editingPlaylistId = signal<number | null>(null);

  // Modal State
  confirmModal = signal<{
    title: string;
    message: string;
    action: () => void;
  } | null>(null);

  // Forms
  songForm = {
    title: '',
    album_id: null as number | null,
    custom_album_title: '',
    artist_ids: [] as number[],
    custom_artist_names: '',
    duration_seconds: 210,
    mood: 'Melodic',
    audio_url: '',
    image_url: '',
    genre_ids: [] as number[],
    is_published: true,
  };

  artistForm = {
    name: '',
    bio: '',
    country: 'India',
    is_featured: true,
    categories: ['Music Composer'],
    image_url: '',
  };

  actorForm = {
    name: '',
    bio: '',
    is_featured: true,
    image_url: '',
  };

  movieForm = {
    title: '',
    release_year: 2024,
    director: '',
    composer_artist_id: null as number | null,
    lead_actor_id: null as number | null,
    character_name: 'Lead',
    poster_url: '',
  };

  albumForm = {
    title: '',
    release_year: 2024,
    movie_id: null as number | null,
    primary_artist_id: null as number | null,
    album_type: 'soundtrack',
    cover_url: '',
  };

  playlistForm = {
    name: '',
    description: '',
    song_ids: [] as number[],
    is_public: true,
  };

  ngOnInit(): void {
    this.refreshAll();
  }

  setTab(t: AdminTab): void {
    this.tab.set(t);
  }

  refreshAll(): void {
    this.adminService.getStats().subscribe({
      next: (s) => this.stats.set(s),
      error: (err) => {
        if (err.status === 401 || err.status === 403) {
          this.errorMsg.set('Session expired or admin permissions required. Please log in with admin@sonara.com / AdminPassword123!');
        }
      },
    });
    this.adminService.getOverview().subscribe({
      next: (o) => this.overview.set(o),
      error: (err) => {
        if (err.status === 401 || err.status === 403) {
          this.errorMsg.set('Session expired or admin permissions required. Please log in with admin@sonara.com / AdminPassword123!');
        }
      },
    });
  }

  private showSuccess(msg: string): void {
    this.successMsg.set(msg);
    this.errorMsg.set('');
    this.refreshAll();
    setTimeout(() => this.successMsg.set(''), 6000);
  }

  private showError(msg: string): void {
    this.errorMsg.set(msg);
    this.successMsg.set('');
    setTimeout(() => this.errorMsg.set(''), 6000);
  }

  // --- Modal Helpers ---
  promptConfirm(title: string, message: string, action: () => void): void {
    this.confirmModal.set({ title, message, action });
  }

  cancelConfirm(): void {
    this.confirmModal.set(null);
  }

  executeConfirm(): void {
    const modal = this.confirmModal();
    if (modal) {
      this.confirmModal.set(null);
      modal.action();
    }
  }

  formatDuration(secs: number): string {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  // ==================== SONGS ====================
  editSong(song: CatalogSongItem): void {
    this.editingSongId.set(song.id);
    this.songForm = {
      title: song.title,
      album_id: song.album_id ?? null,
      custom_album_title: '',
      artist_ids: song.artist_ids ?? [],
      custom_artist_names: '',
      duration_seconds: song.duration,
      mood: song.mood ?? 'Melodic',
      audio_url: song.audio_url ?? '',
      image_url: song.image_url ?? '',
      genre_ids: song.genre_ids ?? [],
      is_published: song.is_published ?? true,
    };
  }

  cancelSongEdit(): void {
    this.editingSongId.set(null);
    this.songForm = {
      title: '',
      album_id: null,
      custom_album_title: '',
      artist_ids: [],
      custom_artist_names: '',
      duration_seconds: 210,
      mood: 'Melodic',
      audio_url: '',
      image_url: '',
      genre_ids: [],
      is_published: true,
    };
  }

  submitSong(): void {
    if (!this.songForm.title.trim()) return;

    if (this.editingSongId()) {
      this.adminService.updateSong(this.editingSongId()!, this.songForm).subscribe({
        next: () => {
          this.showSuccess(`Song "${this.songForm.title}" updated successfully!`);
          this.cancelSongEdit();
        },
        error: (e) => this.showError(e.error?.detail || 'Failed to update song.'),
      });
    } else {
      this.adminService.addSong(this.songForm).subscribe({
        next: () => {
          this.showSuccess(`Song "${this.songForm.title}" published to catalog!`);
          this.cancelSongEdit();
        },
        error: (e) => this.showError(e.error?.detail || 'Failed to add song.'),
      });
    }
  }

  deleteSong(id: number): void {
    this.promptConfirm(
      'Delete Song',
      `Are you sure you want to permanently delete song #${id}?`,
      () => {
        this.adminService.deleteSong(id).subscribe({
          next: () => this.showSuccess(`Song #${id} deleted successfully.`),
          error: (e) => this.showError(e.error?.detail || 'Failed to delete song.'),
        });
      }
    );
  }

  // ==================== ARTISTS ====================
  editArtist(art: CatalogArtistItem): void {
    this.editingArtistId.set(art.id);
    this.artistForm = {
      name: art.name,
      bio: art.bio ?? '',
      country: art.country ?? 'India',
      is_featured: art.is_featured ?? true,
      categories: art.categories ?? ['Music Composer'],
      image_url: art.image_url ?? '',
    };
  }

  cancelArtistEdit(): void {
    this.editingArtistId.set(null);
    this.artistForm = {
      name: '',
      bio: '',
      country: 'India',
      is_featured: true,
      categories: ['Music Composer'],
      image_url: '',
    };
  }

  submitArtist(): void {
    if (!this.artistForm.name.trim()) return;

    if (this.editingArtistId()) {
      this.adminService.updateArtist(this.editingArtistId()!, this.artistForm).subscribe({
        next: () => {
          this.showSuccess(`Artist "${this.artistForm.name}" updated!`);
          this.cancelArtistEdit();
        },
        error: (e) => this.showError(e.error?.detail || 'Failed to update artist.'),
      });
    } else {
      this.adminService.addArtist(this.artistForm).subscribe({
        next: () => {
          this.showSuccess(`Artist "${this.artistForm.name}" added to catalog!`);
          this.cancelArtistEdit();
        },
        error: (e) => this.showError(e.error?.detail || 'Failed to add artist.'),
      });
    }
  }

  deleteArtist(id: number): void {
    this.promptConfirm(
      'Delete Artist',
      `Are you sure you want to remove artist #${id} from the catalog?`,
      () => {
        this.adminService.deleteArtist(id).subscribe({
          next: () => this.showSuccess(`Artist #${id} removed from catalog.`),
          error: (e) => this.showError(e.error?.detail || 'Failed to delete artist.'),
        });
      }
    );
  }

  // ==================== ACTORS ====================
  editActor(act: CatalogActorItem): void {
    this.editingActorId.set(act.id);
    this.actorForm = {
      name: act.name,
      bio: act.bio ?? '',
      is_featured: act.is_featured ?? true,
      image_url: act.image_url ?? '',
    };
  }

  cancelActorEdit(): void {
    this.editingActorId.set(null);
    this.actorForm = {
      name: '',
      bio: '',
      is_featured: true,
      image_url: '',
    };
  }

  submitActor(): void {
    if (!this.actorForm.name.trim()) return;

    if (this.editingActorId()) {
      this.adminService.updateActor(this.editingActorId()!, this.actorForm).subscribe({
        next: () => {
          this.showSuccess(`Actor "${this.actorForm.name}" updated!`);
          this.cancelActorEdit();
        },
        error: (e) => this.showError(e.error?.detail || 'Failed to update actor.'),
      });
    } else {
      this.adminService.addActor(this.actorForm).subscribe({
        next: () => {
          this.showSuccess(`Actor "${this.actorForm.name}" added to database!`);
          this.cancelActorEdit();
        },
        error: (e) => this.showError(e.error?.detail || 'Failed to add actor.'),
      });
    }
  }

  deleteActor(id: number): void {
    this.promptConfirm(
      'Delete Actor',
      `Are you sure you want to delete actor #${id} from the database?`,
      () => {
        this.adminService.deleteActor(id).subscribe({
          next: () => this.showSuccess(`Actor #${id} deleted from database.`),
          error: (e) => this.showError(e.error?.detail || 'Failed to delete actor.'),
        });
      }
    );
  }

  // ==================== MOVIES ====================
  editMovie(m: CatalogMovieItem): void {
    this.editingMovieId.set(m.id);
    this.movieForm = {
      title: m.title,
      release_year: m.year ?? 2024,
      director: m.director ?? '',
      composer_artist_id: m.composer_artist_id ?? null,
      lead_actor_id: null,
      character_name: 'Lead',
      poster_url: m.poster_url ?? '',
    };
  }

  cancelMovieEdit(): void {
    this.editingMovieId.set(null);
    this.movieForm = {
      title: '',
      release_year: 2024,
      director: '',
      composer_artist_id: null,
      lead_actor_id: null,
      character_name: 'Lead',
      poster_url: '',
    };
  }

  submitMovie(): void {
    if (!this.movieForm.title.trim()) return;
    const cast = this.movieForm.lead_actor_id
      ? [{ actor_id: this.movieForm.lead_actor_id, character_name: this.movieForm.character_name }]
      : [];

    if (this.editingMovieId()) {
      this.adminService.updateMovie(this.editingMovieId()!, {
        title: this.movieForm.title,
        release_year: this.movieForm.release_year,
        director: this.movieForm.director,
        composer_artist_id: this.movieForm.composer_artist_id,
        cast: cast.length > 0 ? cast : undefined,
        poster_url: this.movieForm.poster_url,
      }).subscribe({
        next: () => {
          this.showSuccess(`Movie "${this.movieForm.title}" updated!`);
          this.cancelMovieEdit();
        },
        error: (e) => this.showError(e.error?.detail || 'Failed to update movie.'),
      });
    } else {
      this.adminService.addMovie({
        title: this.movieForm.title,
        release_year: this.movieForm.release_year,
        director: this.movieForm.director,
        composer_artist_id: this.movieForm.composer_artist_id,
        cast,
        poster_url: this.movieForm.poster_url,
      }).subscribe({
        next: () => {
          this.showSuccess(`Movie "${this.movieForm.title}" created!`);
          this.cancelMovieEdit();
        },
        error: (e) => this.showError(e.error?.detail || 'Failed to add movie.'),
      });
    }
  }

  deleteMovie(id: number): void {
    this.promptConfirm(
      'Delete Movie',
      `Are you sure you want to delete movie #${id}?`,
      () => {
        this.adminService.deleteMovie(id).subscribe({
          next: () => this.showSuccess(`Movie #${id} deleted.`),
          error: (e) => this.showError(e.error?.detail || 'Failed to delete movie.'),
        });
      }
    );
  }

  // ==================== ALBUMS ====================
  editAlbum(alb: CatalogAlbumItem): void {
    this.editingAlbumId.set(alb.id);
    this.albumForm = {
      title: alb.title,
      release_year: alb.year ?? 2024,
      movie_id: alb.movie_id ?? null,
      primary_artist_id: null,
      album_type: alb.type ?? 'soundtrack',
      cover_url: alb.cover_url ?? '',
    };
  }

  cancelAlbumEdit(): void {
    this.editingAlbumId.set(null);
    this.albumForm = {
      title: '',
      release_year: 2024,
      movie_id: null,
      primary_artist_id: null,
      album_type: 'soundtrack',
      cover_url: '',
    };
  }

  submitAlbum(): void {
    if (!this.albumForm.title.trim()) return;

    if (this.editingAlbumId()) {
      this.adminService.updateAlbum(this.editingAlbumId()!, this.albumForm).subscribe({
        next: () => {
          this.showSuccess(`Album "${this.albumForm.title}" updated!`);
          this.cancelAlbumEdit();
        },
        error: (e) => this.showError(e.error?.detail || 'Failed to update album.'),
      });
    } else {
      this.adminService.addAlbum(this.albumForm).subscribe({
        next: () => {
          this.showSuccess(`Album "${this.albumForm.title}" created!`);
          this.cancelAlbumEdit();
        },
        error: (e) => this.showError(e.error?.detail || 'Failed to create album.'),
      });
    }
  }

  deleteAlbum(id: number): void {
    this.promptConfirm(
      'Delete Album',
      `Are you sure you want to delete album #${id}?`,
      () => {
        this.adminService.deleteAlbum(id).subscribe({
          next: () => this.showSuccess(`Album #${id} deleted.`),
          error: (e) => this.showError(e.error?.detail || 'Failed to delete album.'),
        });
      }
    );
  }

  // ==================== PLAYLISTS ====================
  editPlaylist(p: CatalogPlaylistItem): void {
    this.editingPlaylistId.set(p.id);
    this.playlistForm = {
      name: p.name,
      description: p.description ?? '',
      song_ids: [],
      is_public: p.is_public ?? true,
    };
  }

  cancelPlaylistEdit(): void {
    this.editingPlaylistId.set(null);
    this.playlistForm = {
      name: '',
      description: '',
      song_ids: [],
      is_public: true,
    };
  }

  submitPlaylist(): void {
    if (!this.playlistForm.name.trim()) return;

    if (this.editingPlaylistId()) {
      this.adminService.updateCuratedPlaylist(this.editingPlaylistId()!, this.playlistForm).subscribe({
        next: () => {
          this.showSuccess(`Playlist "${this.playlistForm.name}" updated!`);
          this.cancelPlaylistEdit();
        },
        error: (e) => this.showError(e.error?.detail || 'Failed to update playlist.'),
      });
    } else {
      this.adminService.createCuratedPlaylist(this.playlistForm).subscribe({
        next: () => {
          this.showSuccess(`Curated Playlist "${this.playlistForm.name}" published!`);
          this.cancelPlaylistEdit();
        },
        error: (e) => this.showError(e.error?.detail || 'Failed to publish playlist.'),
      });
    }
  }

  deletePlaylist(id: number): void {
    this.promptConfirm(
      'Delete Playlist',
      `Are you sure you want to delete playlist #${id}?`,
      () => {
        this.adminService.deletePlaylist(id).subscribe({
          next: () => this.showSuccess(`Playlist #${id} deleted.`),
          error: (e) => this.showError(e.error?.detail || 'Failed to delete playlist.'),
        });
      }
    );
  }
}
