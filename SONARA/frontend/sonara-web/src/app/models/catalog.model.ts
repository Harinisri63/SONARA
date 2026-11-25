export interface Track {
  id: number;
  title: string;
  duration_seconds: number;
  play_count?: number;
  mood?: string;
  album_id?: number;
  album_title?: string;
  stream_url: string;
  cover_url?: string;
  image_url?: string;
  audio_url?: string;
  artists: { id: number; name: string }[];
}

export interface ArtistSummary {
  id: number;
  name: string;
  bio?: string;
  country?: string;
  is_featured: boolean;
  image_url?: string;
}

export interface ActorSummary {
  id: number;
  name: string;
  bio?: string;
  is_featured: boolean;
  image_url?: string;
}

export interface MovieSummary {
  id: number;
  title: string;
  release_year?: number;
  director?: string;
  poster_url?: string;
  character_name?: string;
  soundtrack_album_id?: number;
  songs?: Track[];
}

export interface AlbumSummary {
  id: number;
  title: string;
  release_year?: number;
  album_type: string;
  cover_url?: string;
  artists?: { id: number; name: string }[];
  songs?: Track[];
}

export interface HomeFeed {
  trending_songs: Track[];
  popular_artists: ArtistSummary[];
  popular_actors: ActorSummary[];
  featured_albums: AlbumSummary[];
  new_releases: Track[];
}
