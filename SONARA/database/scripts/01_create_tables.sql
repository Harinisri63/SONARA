USE [SONARA];
GO

-- Table: artist_categories
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'artist_categories')
BEGIN
    CREATE TABLE artist_categories (
    	id BIGINT NOT NULL IDENTITY, 
    	name VARCHAR(80) NOT NULL, 
    	PRIMARY KEY (id), 
    	UNIQUE (name)
    );
END
GO

-- Table: featured_content
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'featured_content')
BEGIN
    CREATE TABLE featured_content (
    	id BIGINT NOT NULL IDENTITY, 
    	entity_type VARCHAR(20) NOT NULL, 
    	entity_id BIGINT NOT NULL, 
    	section VARCHAR(40) NOT NULL, 
    	sort_order INTEGER NOT NULL, 
    	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    	updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    	PRIMARY KEY (id)
    );
END
GO

-- Table: genres
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'genres')
BEGIN
    CREATE TABLE genres (
    	id BIGINT NOT NULL IDENTITY, 
    	name VARCHAR(80) NOT NULL, 
    	PRIMARY KEY (id), 
    	UNIQUE (name)
    );
END
GO

-- Table: languages
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'languages')
BEGIN
    CREATE TABLE languages (
    	id BIGINT NOT NULL IDENTITY, 
    	code VARCHAR(10) NOT NULL, 
    	name VARCHAR(50) NOT NULL, 
    	PRIMARY KEY (id), 
    	UNIQUE (code)
    );
END
GO

-- Table: media_assets
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'media_assets')
BEGIN
    CREATE TABLE media_assets (
    	id BIGINT NOT NULL IDENTITY, 
    	storage_key VARCHAR(500) NOT NULL, 
    	kind VARCHAR(20) NOT NULL, 
    	mime_type VARCHAR(100) NOT NULL, 
    	size_bytes BIGINT NOT NULL, 
    	checksum VARCHAR(64) NULL, 
    	duration_seconds INTEGER NULL, 
    	uploaded_by BIGINT NULL, 
    	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    	updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    	PRIMARY KEY (id), 
    	CONSTRAINT ck_media_kind CHECK (kind IN ('audio','image')), 
    	UNIQUE (storage_key)
    );
END
GO

-- Table: roles
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'roles')
BEGIN
    CREATE TABLE roles (
    	id BIGINT NOT NULL IDENTITY, 
    	name VARCHAR(50) NOT NULL, 
    	PRIMARY KEY (id), 
    	UNIQUE (name)
    );
END
GO

-- Table: actors
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'actors')
BEGIN
    CREATE TABLE actors (
    	id BIGINT NOT NULL IDENTITY, 
    	name VARCHAR(200) NOT NULL, 
    	bio TEXT NULL, 
    	image_asset_id BIGINT NULL, 
    	is_featured BIT NOT NULL, 
    	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    	updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    	is_deleted BIT NOT NULL, 
    	PRIMARY KEY (id), 
    	FOREIGN KEY(image_asset_id) REFERENCES media_assets (id)
    );
END
GO

-- Table: artists
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'artists')
BEGIN
    CREATE TABLE artists (
    	id BIGINT NOT NULL IDENTITY, 
    	name VARCHAR(200) NOT NULL, 
    	bio TEXT NULL, 
    	country VARCHAR(80) NULL, 
    	image_asset_id BIGINT NULL, 
    	is_featured BIT NOT NULL, 
    	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    	updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    	is_deleted BIT NOT NULL, 
    	PRIMARY KEY (id), 
    	FOREIGN KEY(image_asset_id) REFERENCES media_assets (id)
    );
END
GO

-- Table: users
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'users')
BEGIN
    CREATE TABLE users (
    	id BIGINT NOT NULL IDENTITY, 
    	email VARCHAR(255) NOT NULL, 
    	username VARCHAR(50) NOT NULL, 
    	password_hash VARCHAR(255) NOT NULL, 
    	full_name VARCHAR(150) NOT NULL, 
    	profile_image_asset_id BIGINT NULL, 
    	is_active BIT NOT NULL, 
    	email_verified BIT NOT NULL, 
    	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    	updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    	is_deleted BIT NOT NULL, 
    	PRIMARY KEY (id), 
    	UNIQUE (email), 
    	UNIQUE (username), 
    	FOREIGN KEY(profile_image_asset_id) REFERENCES media_assets (id)
    );
END
GO

-- Table: artist_category_map
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'artist_category_map')
BEGIN
    CREATE TABLE artist_category_map (
    	artist_id BIGINT NOT NULL, 
    	category_id BIGINT NOT NULL, 
    	PRIMARY KEY (artist_id, category_id), 
    	FOREIGN KEY(artist_id) REFERENCES artists (id), 
    	FOREIGN KEY(category_id) REFERENCES artist_categories (id)
    );
END
GO

-- Table: artist_relations
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'artist_relations')
BEGIN
    CREATE TABLE artist_relations (
    	artist_id BIGINT NOT NULL, 
    	related_artist_id BIGINT NOT NULL, 
    	PRIMARY KEY (artist_id, related_artist_id), 
    	CONSTRAINT ck_artist_not_self CHECK (artist_id <> related_artist_id), 
    	FOREIGN KEY(artist_id) REFERENCES artists (id), 
    	FOREIGN KEY(related_artist_id) REFERENCES artists (id)
    );
END
GO

-- Table: audit_log
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'audit_log')
BEGIN
    CREATE TABLE audit_log (
    	id BIGINT NOT NULL IDENTITY, 
    	actor_user_id BIGINT NULL, 
    	action VARCHAR(80) NOT NULL, 
    	entity_type VARCHAR(40) NULL, 
    	entity_id BIGINT NULL, 
    	at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    	PRIMARY KEY (id), 
    	FOREIGN KEY(actor_user_id) REFERENCES users (id)
    );
END
GO

-- Table: favorites
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'favorites')
BEGIN
    CREATE TABLE favorites (
    	id BIGINT NOT NULL IDENTITY, 
    	user_id BIGINT NOT NULL, 
    	entity_type VARCHAR(20) NOT NULL, 
    	entity_id BIGINT NOT NULL, 
    	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    	updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    	PRIMARY KEY (id), 
    	CONSTRAINT uq_favorite UNIQUE (user_id, entity_type, entity_id), 
    	CONSTRAINT ck_favorite_type CHECK (entity_type IN ('song','album','artist','playlist')), 
    	FOREIGN KEY(user_id) REFERENCES users (id)
    );
END
GO

-- Table: library_items
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'library_items')
BEGIN
    CREATE TABLE library_items (
    	id BIGINT NOT NULL IDENTITY, 
    	user_id BIGINT NOT NULL, 
    	entity_type VARCHAR(20) NOT NULL, 
    	entity_id BIGINT NOT NULL, 
    	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    	updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    	PRIMARY KEY (id), 
    	CONSTRAINT uq_library_item UNIQUE (user_id, entity_type, entity_id), 
    	FOREIGN KEY(user_id) REFERENCES users (id)
    );
END
GO

-- Table: movies
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'movies')
BEGIN
    CREATE TABLE movies (
    	id BIGINT NOT NULL IDENTITY, 
    	title VARCHAR(250) NOT NULL, 
    	release_year INTEGER NULL, 
    	director VARCHAR(200) NULL, 
    	poster_asset_id BIGINT NULL, 
    	language_id BIGINT NULL, 
    	music_composer_artist_id BIGINT NULL, 
    	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    	updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    	is_deleted BIT NOT NULL, 
    	PRIMARY KEY (id), 
    	FOREIGN KEY(poster_asset_id) REFERENCES media_assets (id), 
    	FOREIGN KEY(language_id) REFERENCES languages (id), 
    	FOREIGN KEY(music_composer_artist_id) REFERENCES artists (id)
    );
END
GO

-- Table: password_reset_tokens
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'password_reset_tokens')
BEGIN
    CREATE TABLE password_reset_tokens (
    	id BIGINT NOT NULL IDENTITY, 
    	user_id BIGINT NOT NULL, 
    	token_hash VARCHAR(64) NOT NULL, 
    	expires_at DATETIME NOT NULL, 
    	used_at DATETIME NULL, 
    	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    	updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    	PRIMARY KEY (id), 
    	FOREIGN KEY(user_id) REFERENCES users (id), 
    	UNIQUE (token_hash)
    );
END
GO

-- Table: playlists
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'playlists')
BEGIN
    CREATE TABLE playlists (
    	id BIGINT NOT NULL IDENTITY, 
    	owner_user_id BIGINT NOT NULL, 
    	name VARCHAR(150) NOT NULL, 
    	description VARCHAR(500) NULL, 
    	is_public BIT NOT NULL, 
    	cover_asset_id BIGINT NULL, 
    	share_token VARCHAR(64) NULL, 
    	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    	updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    	is_deleted BIT NOT NULL, 
    	PRIMARY KEY (id), 
    	FOREIGN KEY(owner_user_id) REFERENCES users (id), 
    	FOREIGN KEY(cover_asset_id) REFERENCES media_assets (id), 
    	UNIQUE (share_token)
    );
END
GO

-- Table: refresh_tokens
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'refresh_tokens')
BEGIN
    CREATE TABLE refresh_tokens (
    	id BIGINT NOT NULL IDENTITY, 
    	user_id BIGINT NOT NULL, 
    	token_hash VARCHAR(64) NOT NULL, 
    	family_id VARCHAR(36) NOT NULL, 
    	expires_at DATETIME NOT NULL, 
    	revoked_at DATETIME NULL, 
    	replaced_by_id BIGINT NULL, 
    	client_type VARCHAR(10) NOT NULL, 
    	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    	updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    	PRIMARY KEY (id), 
    	FOREIGN KEY(user_id) REFERENCES users (id), 
    	UNIQUE (token_hash), 
    	FOREIGN KEY(replaced_by_id) REFERENCES refresh_tokens (id)
    );
END
GO

-- Table: search_history
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'search_history')
BEGIN
    CREATE TABLE search_history (
    	id BIGINT NOT NULL IDENTITY, 
    	user_id BIGINT NOT NULL, 
    	query VARCHAR(200) NOT NULL, 
    	searched_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    	PRIMARY KEY (id), 
    	FOREIGN KEY(user_id) REFERENCES users (id)
    );
END
GO

-- Table: user_roles
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'user_roles')
BEGIN
    CREATE TABLE user_roles (
    	user_id BIGINT NOT NULL, 
    	role_id BIGINT NOT NULL, 
    	PRIMARY KEY (user_id, role_id), 
    	FOREIGN KEY(user_id) REFERENCES users (id), 
    	FOREIGN KEY(role_id) REFERENCES roles (id)
    );
END
GO

-- Table: albums
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'albums')
BEGIN
    CREATE TABLE albums (
    	id BIGINT NOT NULL IDENTITY, 
    	title VARCHAR(250) NOT NULL, 
    	release_year INTEGER NULL, 
    	cover_asset_id BIGINT NULL, 
    	movie_id BIGINT NULL, 
    	album_type VARCHAR(20) NOT NULL, 
    	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    	updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    	is_deleted BIT NOT NULL, 
    	PRIMARY KEY (id), 
    	FOREIGN KEY(cover_asset_id) REFERENCES media_assets (id), 
    	FOREIGN KEY(movie_id) REFERENCES movies (id)
    );
END
GO

-- Table: movie_actors
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'movie_actors')
BEGIN
    CREATE TABLE movie_actors (
    	movie_id BIGINT NOT NULL, 
    	actor_id BIGINT NOT NULL, 
    	character_name VARCHAR(200) NULL, 
    	billing_order INTEGER NOT NULL, 
    	PRIMARY KEY (movie_id, actor_id), 
    	FOREIGN KEY(movie_id) REFERENCES movies (id), 
    	FOREIGN KEY(actor_id) REFERENCES actors (id)
    );
END
GO

-- Table: album_artists
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'album_artists')
BEGIN
    CREATE TABLE album_artists (
    	album_id BIGINT NOT NULL, 
    	artist_id BIGINT NOT NULL, 
    	PRIMARY KEY (album_id, artist_id), 
    	FOREIGN KEY(album_id) REFERENCES albums (id), 
    	FOREIGN KEY(artist_id) REFERENCES artists (id)
    );
END
GO

-- Table: songs
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'songs')
BEGIN
    CREATE TABLE songs (
    	id BIGINT NOT NULL IDENTITY, 
    	title VARCHAR(250) NOT NULL, 
    	album_id BIGINT NULL, 
    	track_number INTEGER NULL, 
    	duration_seconds INTEGER NULL, 
    	language_id BIGINT NULL, 
    	audio_asset_id BIGINT NULL, 
    	play_count BIGINT NOT NULL, 
    	mood VARCHAR(40) NULL, 
    	is_published BIT NOT NULL, 
    	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    	updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    	is_deleted BIT NOT NULL, 
    	PRIMARY KEY (id), 
    	FOREIGN KEY(album_id) REFERENCES albums (id), 
    	FOREIGN KEY(language_id) REFERENCES languages (id), 
    	FOREIGN KEY(audio_asset_id) REFERENCES media_assets (id)
    );
END
GO

-- Table: listening_history
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'listening_history')
BEGIN
    CREATE TABLE listening_history (
    	id BIGINT NOT NULL IDENTITY, 
    	user_id BIGINT NOT NULL, 
    	song_id BIGINT NOT NULL, 
    	played_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    	listened_seconds INTEGER NOT NULL, 
    	completed BIT NOT NULL, 
    	PRIMARY KEY (id), 
    	FOREIGN KEY(user_id) REFERENCES users (id), 
    	FOREIGN KEY(song_id) REFERENCES songs (id)
    );
END
GO

-- Table: lyrics
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'lyrics')
BEGIN
    CREATE TABLE lyrics (
    	id BIGINT NOT NULL IDENTITY, 
    	song_id BIGINT NOT NULL, 
    	language_id BIGINT NULL, 
    	plain_text TEXT NULL, 
    	timed_json TEXT NULL, 
    	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    	updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    	PRIMARY KEY (id), 
    	FOREIGN KEY(song_id) REFERENCES songs (id), 
    	FOREIGN KEY(language_id) REFERENCES languages (id)
    );
END
GO

-- Table: playlist_songs
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'playlist_songs')
BEGIN
    CREATE TABLE playlist_songs (
    	playlist_id BIGINT NOT NULL, 
    	song_id BIGINT NOT NULL, 
    	position INTEGER NOT NULL, 
    	added_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    	PRIMARY KEY (playlist_id, song_id), 
    	CONSTRAINT uq_playlist_position UNIQUE (playlist_id, position), 
    	FOREIGN KEY(playlist_id) REFERENCES playlists (id), 
    	FOREIGN KEY(song_id) REFERENCES songs (id)
    );
END
GO

-- Table: song_artists
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'song_artists')
BEGIN
    CREATE TABLE song_artists (
    	song_id BIGINT NOT NULL, 
    	artist_id BIGINT NOT NULL, 
    	role VARCHAR(30) NOT NULL, 
    	PRIMARY KEY (song_id, artist_id, role), 
    	FOREIGN KEY(song_id) REFERENCES songs (id), 
    	FOREIGN KEY(artist_id) REFERENCES artists (id)
    );
END
GO

-- Table: song_genres
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'song_genres')
BEGIN
    CREATE TABLE song_genres (
    	song_id BIGINT NOT NULL, 
    	genre_id BIGINT NOT NULL, 
    	PRIMARY KEY (song_id, genre_id), 
    	FOREIGN KEY(song_id) REFERENCES songs (id), 
    	FOREIGN KEY(genre_id) REFERENCES genres (id)
    );
END
GO

