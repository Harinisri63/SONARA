import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './app/core/guards/auth.guard';
import { roleGuard } from './app/core/guards/role.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'explore',
    canActivate: [authGuard],
    loadComponent: () => import('./features/explore/explore.component').then((m) => m.ExploreComponent),
  },
  {
    path: 'artists',
    canActivate: [authGuard],
    loadComponent: () => import('./features/artists/artists.component').then((m) => m.ArtistsComponent),
  },
  {
    path: 'artists/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/artists/artist-detail.component').then((m) => m.ArtistDetailComponent),
  },
  {
    path: 'actors',
    canActivate: [authGuard],
    loadComponent: () => import('./features/actors/actors.component').then((m) => m.ActorsComponent),
  },
  {
    path: 'actors/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/actors/actor-detail.component').then((m) => m.ActorDetailComponent),
  },
  {
    path: 'movies',
    canActivate: [authGuard],
    loadComponent: () => import('./features/movies/movies.component').then((m) => m.MoviesComponent),
  },
  {
    path: 'movies/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/movies/movie-detail.component').then((m) => m.MovieDetailComponent),
  },
  {
    path: 'albums/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/albums/album-detail.component').then((m) => m.AlbumDetailComponent),
  },
  {
    path: 'library',
    canActivate: [authGuard],
    loadComponent: () => import('./features/library/library.component').then((m) => m.LibraryComponent),
  },
  {
    path: 'favorites',
    canActivate: [authGuard],
    loadComponent: () => import('./features/favorites/favorites.component').then((m) => m.FavoritesComponent),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/profile.component').then((m) => m.ProfileComponent),
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard('Admin')],
    loadComponent: () => import('./features/admin/admin.component').then((m) => m.AdminComponent),
  },
  { path: '**', redirectTo: 'home' },
];
