-- =========================================================================
-- SONARA ECOSYSTEM - COMPLETE SQL SERVER DATABASE SETUP & SEED SCRIPT
-- =========================================================================

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


-- =========================================================================
-- SEED DATA INSERTS
-- =========================================================================

USE [SONARA];
GO

-- Seed data for roles (2 rows)
SET IDENTITY_INSERT [roles] ON;
INSERT INTO [roles] ([id], [name]) VALUES (1, N'User');
INSERT INTO [roles] ([id], [name]) VALUES (2, N'Admin');
SET IDENTITY_INSERT [roles] OFF;
GO

-- Seed data for languages (6 rows)
SET IDENTITY_INSERT [languages] ON;
INSERT INTO [languages] ([id], [code], [name]) VALUES (1, N'ta', N'Tamil');
INSERT INTO [languages] ([id], [code], [name]) VALUES (2, N'te', N'Telugu');
INSERT INTO [languages] ([id], [code], [name]) VALUES (3, N'hi', N'Hindi');
INSERT INTO [languages] ([id], [code], [name]) VALUES (4, N'ml', N'Malayalam');
INSERT INTO [languages] ([id], [code], [name]) VALUES (5, N'kn', N'Kannada');
INSERT INTO [languages] ([id], [code], [name]) VALUES (6, N'en', N'English');
SET IDENTITY_INSERT [languages] OFF;
GO

-- Seed data for genres (9 rows)
SET IDENTITY_INSERT [genres] ON;
INSERT INTO [genres] ([id], [name]) VALUES (1, N'Melody');
INSERT INTO [genres] ([id], [name]) VALUES (2, N'Romantic');
INSERT INTO [genres] ([id], [name]) VALUES (3, N'Classical');
INSERT INTO [genres] ([id], [name]) VALUES (4, N'Rock');
INSERT INTO [genres] ([id], [name]) VALUES (5, N'Pop');
INSERT INTO [genres] ([id], [name]) VALUES (6, N'Hip-hop');
INSERT INTO [genres] ([id], [name]) VALUES (7, N'Electronic');
INSERT INTO [genres] ([id], [name]) VALUES (8, N'Instrumental');
INSERT INTO [genres] ([id], [name]) VALUES (9, N'Lo-fi');
SET IDENTITY_INSERT [genres] OFF;
GO

-- Seed data for artist_categories (5 rows)
SET IDENTITY_INSERT [artist_categories] ON;
INSERT INTO [artist_categories] ([id], [name]) VALUES (1, N'Music Composer');
INSERT INTO [artist_categories] ([id], [name]) VALUES (2, N'Playback Singer');
INSERT INTO [artist_categories] ([id], [name]) VALUES (3, N'Music Director');
INSERT INTO [artist_categories] ([id], [name]) VALUES (4, N'Independent Artist');
INSERT INTO [artist_categories] ([id], [name]) VALUES (5, N'Band');
SET IDENTITY_INSERT [artist_categories] OFF;
GO

-- Seed data for users (2 rows)
SET IDENTITY_INSERT [users] ON;
INSERT INTO [users] ([id], [email], [username], [password_hash], [full_name], [profile_image_asset_id], [is_active], [email_verified], [created_at], [updated_at], [is_deleted]) VALUES (1, N'harinisri0312@gmail.com', N'Harini', N'$argon2id$v=19$m=65536,t=3,p=4$1Nug/OP5FQHosRaFcuLIlg$66JxX2n6b8Q/IB7RNR+gz4EvKOtQIBOdDAMVOksQWcg', N'Harinisri', NULL, 1, 0, N'2026-11-23 08:16:48', N'2026-11-23 08:16:48', 0);
INSERT INTO [users] ([id], [email], [username], [password_hash], [full_name], [profile_image_asset_id], [is_active], [email_verified], [created_at], [updated_at], [is_deleted]) VALUES (2, N'harinisri6349@gmail.com', N'Harish', N'$argon2id$v=19$m=65536,t=3,p=4$4vH6zOqcIrmupX8LySK5GA$reZUS0S99PcQeG7tYsFImFHNCtFwNcpOELWA5YzMznI', N'Harish', NULL, 1, 0, N'2026-11-23 10:04:09', N'2026-11-23 10:04:09', 0);
SET IDENTITY_INSERT [users] OFF;
GO

-- Seed data for user_roles (3 rows)
INSERT INTO [user_roles] ([user_id], [role_id]) VALUES (1, 1);
INSERT INTO [user_roles] ([user_id], [role_id]) VALUES (1, 2);
INSERT INTO [user_roles] ([user_id], [role_id]) VALUES (2, 1);
GO

-- Seed data for media_assets (34 rows)
SET IDENTITY_INSERT [media_assets] ON;
INSERT INTO [media_assets] ([id], [storage_key], [kind], [mime_type], [size_bytes], [checksum], [duration_seconds], [uploaded_by], [created_at], [updated_at]) VALUES (1, N'covers/jailer.jpg', N'image', N'image/jpeg', 5242880, NULL, NULL, NULL, N'2026-11-23 08:24:03', N'2026-11-23 08:24:03');
INSERT INTO [media_assets] ([id], [storage_key], [kind], [mime_type], [size_bytes], [checksum], [duration_seconds], [uploaded_by], [created_at], [updated_at]) VALUES (2, N'covers/vikram.jpg', N'image', N'image/jpeg', 5242880, NULL, NULL, NULL, N'2026-11-23 08:24:03', N'2026-11-23 08:24:03');
INSERT INTO [media_assets] ([id], [storage_key], [kind], [mime_type], [size_bytes], [checksum], [duration_seconds], [uploaded_by], [created_at], [updated_at]) VALUES (3, N'covers/ps1.jpg', N'image', N'image/jpeg', 5242880, NULL, NULL, NULL, N'2026-11-23 08:24:03', N'2026-11-23 08:24:03');
INSERT INTO [media_assets] ([id], [storage_key], [kind], [mime_type], [size_bytes], [checksum], [duration_seconds], [uploaded_by], [created_at], [updated_at]) VALUES (4, N'audio/sample_audio.mp3', N'audio', N'audio/mpeg', 5242880, NULL, 215, NULL, N'2026-11-23 08:24:03', N'2026-11-23 08:24:03');
INSERT INTO [media_assets] ([id], [storage_key], [kind], [mime_type], [size_bytes], [checksum], [duration_seconds], [uploaded_by], [created_at], [updated_at]) VALUES (5, N'artists/anirudh.jpg', N'image', N'image/jpeg', 5242880, NULL, NULL, NULL, N'2026-11-23 08:24:03', N'2026-11-23 08:24:03');
INSERT INTO [media_assets] ([id], [storage_key], [kind], [mime_type], [size_bytes], [checksum], [duration_seconds], [uploaded_by], [created_at], [updated_at]) VALUES (6, N'artists/ar_rahman.jpg', N'image', N'image/jpeg', 5242880, NULL, NULL, NULL, N'2026-11-23 08:24:03', N'2026-11-23 08:24:03');
INSERT INTO [media_assets] ([id], [storage_key], [kind], [mime_type], [size_bytes], [checksum], [duration_seconds], [uploaded_by], [created_at], [updated_at]) VALUES (7, N'artists/ilaiyaraaja.jpg', N'image', N'image/jpeg', 5242880, NULL, NULL, NULL, N'2026-11-23 08:24:03', N'2026-11-23 08:24:03');
INSERT INTO [media_assets] ([id], [storage_key], [kind], [mime_type], [size_bytes], [checksum], [duration_seconds], [uploaded_by], [created_at], [updated_at]) VALUES (8, N'artists/sid_sriram.jpg', N'image', N'image/jpeg', 5242880, NULL, NULL, NULL, N'2026-11-23 08:24:03', N'2026-11-23 08:24:03');
INSERT INTO [media_assets] ([id], [storage_key], [kind], [mime_type], [size_bytes], [checksum], [duration_seconds], [uploaded_by], [created_at], [updated_at]) VALUES (9, N'artists/shreya_ghoshal.jpg', N'image', N'image/jpeg', 5242880, NULL, NULL, NULL, N'2026-11-23 08:24:03', N'2026-11-23 08:24:03');
INSERT INTO [media_assets] ([id], [storage_key], [kind], [mime_type], [size_bytes], [checksum], [duration_seconds], [uploaded_by], [created_at], [updated_at]) VALUES (10, N'actors/rajinikanth.jpg', N'image', N'image/jpeg', 5242880, NULL, NULL, NULL, N'2026-11-23 08:24:03', N'2026-11-23 08:24:03');
INSERT INTO [media_assets] ([id], [storage_key], [kind], [mime_type], [size_bytes], [checksum], [duration_seconds], [uploaded_by], [created_at], [updated_at]) VALUES (11, N'actors/kamal_haasan.jpg', N'image', N'image/jpeg', 5242880, NULL, NULL, NULL, N'2026-11-23 08:24:03', N'2026-11-23 08:24:03');
INSERT INTO [media_assets] ([id], [storage_key], [kind], [mime_type], [size_bytes], [checksum], [duration_seconds], [uploaded_by], [created_at], [updated_at]) VALUES (12, N'actors/vijay.jpg', N'image', N'image/jpeg', 5242880, NULL, NULL, NULL, N'2026-11-23 08:24:03', N'2026-11-23 08:24:03');
INSERT INTO [media_assets] ([id], [storage_key], [kind], [mime_type], [size_bytes], [checksum], [duration_seconds], [uploaded_by], [created_at], [updated_at]) VALUES (13, N'movies/jailer.jpg', N'image', N'image/jpeg', 5242880, NULL, NULL, NULL, N'2026-11-23 08:24:03', N'2026-11-23 08:24:03');
INSERT INTO [media_assets] ([id], [storage_key], [kind], [mime_type], [size_bytes], [checksum], [duration_seconds], [uploaded_by], [created_at], [updated_at]) VALUES (14, N'movies/vikram.jpg', N'image', N'image/jpeg', 5242880, NULL, NULL, NULL, N'2026-11-23 08:24:03', N'2026-11-23 08:24:03');
INSERT INTO [media_assets] ([id], [storage_key], [kind], [mime_type], [size_bytes], [checksum], [duration_seconds], [uploaded_by], [created_at], [updated_at]) VALUES (15, N'movies/ps1.jpg', N'image', N'image/jpeg', 5242880, NULL, NULL, NULL, N'2026-11-23 08:24:03', N'2026-11-23 08:24:03');
INSERT INTO [media_assets] ([id], [storage_key], [kind], [mime_type], [size_bytes], [checksum], [duration_seconds], [uploaded_by], [created_at], [updated_at]) VALUES (16, N'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80', N'image', N'image/jpeg', 5242880, NULL, NULL, NULL, N'2026-11-23 10:15:27', N'2026-11-23 10:15:27');
INSERT INTO [media_assets] ([id], [storage_key], [kind], [mime_type], [size_bytes], [checksum], [duration_seconds], [uploaded_by], [created_at], [updated_at]) VALUES (17, N'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80', N'image', N'image/jpeg', 5242880, NULL, NULL, NULL, N'2026-11-23 10:15:27', N'2026-11-23 10:15:27');
INSERT INTO [media_assets] ([id], [storage_key], [kind], [mime_type], [size_bytes], [checksum], [duration_seconds], [uploaded_by], [created_at], [updated_at]) VALUES (18, N'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80', N'image', N'image/jpeg', 5242880, NULL, NULL, NULL, N'2026-11-23 10:15:27', N'2026-11-23 10:15:27');
INSERT INTO [media_assets] ([id], [storage_key], [kind], [mime_type], [size_bytes], [checksum], [duration_seconds], [uploaded_by], [created_at], [updated_at]) VALUES (19, N'https://images.unsplash.com/photo-1520523839898-50712743e9d7?w=600&auto=format&fit=crop&q=80', N'image', N'image/jpeg', 5242880, NULL, NULL, NULL, N'2026-11-23 10:15:27', N'2026-11-23 10:15:27');
INSERT INTO [media_assets] ([id], [storage_key], [kind], [mime_type], [size_bytes], [checksum], [duration_seconds], [uploaded_by], [created_at], [updated_at]) VALUES (20, N'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80', N'image', N'image/jpeg', 5242880, NULL, NULL, NULL, N'2026-11-23 10:15:27', N'2026-11-23 10:15:27');
INSERT INTO [media_assets] ([id], [storage_key], [kind], [mime_type], [size_bytes], [checksum], [duration_seconds], [uploaded_by], [created_at], [updated_at]) VALUES (21, N'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80', N'image', N'image/jpeg', 5242880, NULL, NULL, NULL, N'2026-11-23 10:15:27', N'2026-11-23 10:15:27');
INSERT INTO [media_assets] ([id], [storage_key], [kind], [mime_type], [size_bytes], [checksum], [duration_seconds], [uploaded_by], [created_at], [updated_at]) VALUES (22, N'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80', N'image', N'image/jpeg', 5242880, NULL, NULL, NULL, N'2026-11-23 10:15:27', N'2026-11-23 10:15:27');
INSERT INTO [media_assets] ([id], [storage_key], [kind], [mime_type], [size_bytes], [checksum], [duration_seconds], [uploaded_by], [created_at], [updated_at]) VALUES (23, N'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&auto=format&fit=crop&q=80', N'image', N'image/jpeg', 5242880, NULL, NULL, NULL, N'2026-11-23 10:15:27', N'2026-11-23 10:15:27');
INSERT INTO [media_assets] ([id], [storage_key], [kind], [mime_type], [size_bytes], [checksum], [duration_seconds], [uploaded_by], [created_at], [updated_at]) VALUES (24, N'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80', N'image', N'image/jpeg', 5242880, NULL, NULL, NULL, N'2026-11-23 10:15:27', N'2026-11-23 10:15:27');
INSERT INTO [media_assets] ([id], [storage_key], [kind], [mime_type], [size_bytes], [checksum], [duration_seconds], [uploaded_by], [created_at], [updated_at]) VALUES (25, N'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80', N'image', N'image/jpeg', 5242880, NULL, NULL, NULL, N'2026-11-23 10:15:27', N'2026-11-23 10:15:27');
INSERT INTO [media_assets] ([id], [storage_key], [kind], [mime_type], [size_bytes], [checksum], [duration_seconds], [uploaded_by], [created_at], [updated_at]) VALUES (26, N'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80', N'image', N'image/jpeg', 5242880, NULL, NULL, NULL, N'2026-11-23 10:15:27', N'2026-11-23 10:15:27');
INSERT INTO [media_assets] ([id], [storage_key], [kind], [mime_type], [size_bytes], [checksum], [duration_seconds], [uploaded_by], [created_at], [updated_at]) VALUES (27, N'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', N'audio', N'audio/mpeg', 5242880, NULL, NULL, NULL, N'2026-11-23 10:15:27', N'2026-11-23 10:15:27');
INSERT INTO [media_assets] ([id], [storage_key], [kind], [mime_type], [size_bytes], [checksum], [duration_seconds], [uploaded_by], [created_at], [updated_at]) VALUES (28, N'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', N'audio', N'audio/mpeg', 5242880, NULL, NULL, NULL, N'2026-11-23 10:15:27', N'2026-11-23 10:15:27');
INSERT INTO [media_assets] ([id], [storage_key], [kind], [mime_type], [size_bytes], [checksum], [duration_seconds], [uploaded_by], [created_at], [updated_at]) VALUES (29, N'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', N'audio', N'audio/mpeg', 5242880, NULL, NULL, NULL, N'2026-11-23 10:15:27', N'2026-11-23 10:15:27');
INSERT INTO [media_assets] ([id], [storage_key], [kind], [mime_type], [size_bytes], [checksum], [duration_seconds], [uploaded_by], [created_at], [updated_at]) VALUES (30, N'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', N'audio', N'audio/mpeg', 5242880, NULL, NULL, NULL, N'2026-11-23 10:15:27', N'2026-11-23 10:15:27');
INSERT INTO [media_assets] ([id], [storage_key], [kind], [mime_type], [size_bytes], [checksum], [duration_seconds], [uploaded_by], [created_at], [updated_at]) VALUES (31, N'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', N'audio', N'audio/mpeg', 5242880, NULL, NULL, NULL, N'2026-11-23 10:15:27', N'2026-11-23 10:15:27');
INSERT INTO [media_assets] ([id], [storage_key], [kind], [mime_type], [size_bytes], [checksum], [duration_seconds], [uploaded_by], [created_at], [updated_at]) VALUES (32, N'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', N'audio', N'audio/mpeg', 5242880, NULL, NULL, NULL, N'2026-11-23 10:15:27', N'2026-11-23 10:15:27');
INSERT INTO [media_assets] ([id], [storage_key], [kind], [mime_type], [size_bytes], [checksum], [duration_seconds], [uploaded_by], [created_at], [updated_at]) VALUES (33, N'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', N'audio', N'audio/mpeg', 5242880, NULL, NULL, NULL, N'2026-11-23 10:15:27', N'2026-11-23 10:15:27');
INSERT INTO [media_assets] ([id], [storage_key], [kind], [mime_type], [size_bytes], [checksum], [duration_seconds], [uploaded_by], [created_at], [updated_at]) VALUES (34, N'https://example.com/test.mp3', N'audio', N'audio/mpeg', 5242880, NULL, NULL, NULL, N'2026-11-23 10:25:20', N'2026-11-23 10:25:20');
SET IDENTITY_INSERT [media_assets] OFF;
GO

-- Seed data for artists (6 rows)
SET IDENTITY_INSERT [artists] ON;
INSERT INTO [artists] ([id], [name], [bio], [country], [image_asset_id], [is_featured], [created_at], [updated_at], [is_deleted]) VALUES (1, N'Anirudh Ravichander', N'Indian music composer and singer known for his high-energy futuristic anthems and global viral hits.', N'India', 16, 1, N'2026-11-23 08:24:03', N'2026-11-23 10:15:27', 0);
INSERT INTO [artists] ([id], [name], [bio], [country], [image_asset_id], [is_featured], [created_at], [updated_at], [is_deleted]) VALUES (2, N'A. R. Rahman', N'Two-time Academy Award-winning composer, singer, and songwriter known as the Mozart of Madras.', N'India', 17, 1, N'2026-11-23 08:24:03', N'2026-11-23 10:15:27', 0);
INSERT INTO [artists] ([id], [name], [bio], [country], [image_asset_id], [is_featured], [created_at], [updated_at], [is_deleted]) VALUES (3, N'Ilaiyaraaja', N'Legendary maestro who has composed over 7,000 songs, renowned for blending Western classical with Indian traditional harmony.', N'India', 18, 1, N'2026-11-23 08:24:03', N'2026-11-23 10:15:27', 0);
INSERT INTO [artists] ([id], [name], [bio], [country], [image_asset_id], [is_featured], [created_at], [updated_at], [is_deleted]) VALUES (4, N'Sid Sriram', N'Carnatic musician, singer and music producer recognized for his soulful vocal phrasing in modern melodies.', N'India', 19, 1, N'2026-11-23 08:24:03', N'2026-11-23 10:15:27', 0);
INSERT INTO [artists] ([id], [name], [bio], [country], [image_asset_id], [is_featured], [created_at], [updated_at], [is_deleted]) VALUES (5, N'Shreya Ghoshal', N'Leading Indian playback singer known for wide vocal versatility and recipient of five National Film Awards.', N'India', 20, 1, N'2026-11-23 08:24:03', N'2026-11-23 10:15:27', 0);
INSERT INTO [artists] ([id], [name], [bio], [country], [image_asset_id], [is_featured], [created_at], [updated_at], [is_deleted]) VALUES (6, N'Admin Test Artist', N'Updated Bio', N'India', NULL, 1, N'2026-11-23 10:25:20', N'2026-11-23 10:25:20', 1);
SET IDENTITY_INSERT [artists] OFF;
GO

-- Seed data for artist_category_map (9 rows)
INSERT INTO [artist_category_map] ([artist_id], [category_id]) VALUES (1, 1);
INSERT INTO [artist_category_map] ([artist_id], [category_id]) VALUES (1, 2);
INSERT INTO [artist_category_map] ([artist_id], [category_id]) VALUES (2, 1);
INSERT INTO [artist_category_map] ([artist_id], [category_id]) VALUES (2, 3);
INSERT INTO [artist_category_map] ([artist_id], [category_id]) VALUES (3, 1);
INSERT INTO [artist_category_map] ([artist_id], [category_id]) VALUES (3, 3);
INSERT INTO [artist_category_map] ([artist_id], [category_id]) VALUES (4, 2);
INSERT INTO [artist_category_map] ([artist_id], [category_id]) VALUES (5, 2);
INSERT INTO [artist_category_map] ([artist_id], [category_id]) VALUES (6, 1);
GO

-- Seed data for actors (3 rows)
SET IDENTITY_INSERT [actors] ON;
INSERT INTO [actors] ([id], [name], [bio], [image_asset_id], [is_featured], [created_at], [updated_at], [is_deleted]) VALUES (1, N'Rajinikanth', N'Superstar of Indian cinema with a career spanning five decades, acclaimed for unmatched style, charisma, and massive box office impact.', 21, 1, N'2026-11-23 08:24:03', N'2026-11-23 10:15:27', 0);
INSERT INTO [actors] ([id], [name], [bio], [image_asset_id], [is_featured], [created_at], [updated_at], [is_deleted]) VALUES (2, N'Kamal Haasan', N'Polymath actor, director, producer, and playback singer widely recognized as one of cinema''s finest performing artists.', 22, 1, N'2026-11-23 08:24:03', N'2026-11-23 10:15:27', 0);
INSERT INTO [actors] ([id], [name], [bio], [image_asset_id], [is_featured], [created_at], [updated_at], [is_deleted]) VALUES (3, N'Vijay', N'Leading superstar known as ''Thalapathy'', dominating modern South Indian box office records with chart-topping musical tracks.', 23, 1, N'2026-11-23 08:24:03', N'2026-11-23 10:15:27', 0);
SET IDENTITY_INSERT [actors] OFF;
GO

-- Seed data for movies (3 rows)
SET IDENTITY_INSERT [movies] ON;
INSERT INTO [movies] ([id], [title], [release_year], [director], [poster_asset_id], [language_id], [music_composer_artist_id], [created_at], [updated_at], [is_deleted]) VALUES (1, N'Jailer', 2023, N'Nelson Dilipkumar', 24, 1, 1, N'2026-11-23 08:24:03', N'2026-11-23 10:15:27', 0);
INSERT INTO [movies] ([id], [title], [release_year], [director], [poster_asset_id], [language_id], [music_composer_artist_id], [created_at], [updated_at], [is_deleted]) VALUES (2, N'Vikram', 2022, N'Lokesh Kanagaraj', 25, 1, 1, N'2026-11-23 08:24:03', N'2026-11-23 10:15:27', 0);
INSERT INTO [movies] ([id], [title], [release_year], [director], [poster_asset_id], [language_id], [music_composer_artist_id], [created_at], [updated_at], [is_deleted]) VALUES (3, N'Ponniyin Selvan: Part 1', 2022, N'Mani Ratnam', 26, 1, 2, N'2026-11-23 08:24:03', N'2026-11-23 10:15:27', 0);
SET IDENTITY_INSERT [movies] OFF;
GO

-- Seed data for movie_actors (3 rows)
INSERT INTO [movie_actors] ([movie_id], [actor_id], [character_name], [billing_order]) VALUES (1, 1, N'Muthuvel Pandian (Tiger)', 1);
INSERT INTO [movie_actors] ([movie_id], [actor_id], [character_name], [billing_order]) VALUES (2, 2, N'Agent Vikram / Amar', 1);
INSERT INTO [movie_actors] ([movie_id], [actor_id], [character_name], [billing_order]) VALUES (3, 2, N'Narrator', 1);
GO

-- Seed data for albums (3 rows)
SET IDENTITY_INSERT [albums] ON;
INSERT INTO [albums] ([id], [title], [release_year], [cover_asset_id], [movie_id], [album_type], [created_at], [updated_at], [is_deleted]) VALUES (1, N'Jailer (Original Motion Picture Soundtrack)', 2023, 24, 1, N'soundtrack', N'2026-11-23 08:24:03', N'2026-11-23 10:15:27', 0);
INSERT INTO [albums] ([id], [title], [release_year], [cover_asset_id], [movie_id], [album_type], [created_at], [updated_at], [is_deleted]) VALUES (2, N'Vikram (Original Motion Picture Soundtrack)', 2022, 25, 2, N'soundtrack', N'2026-11-23 08:24:03', N'2026-11-23 10:15:27', 0);
INSERT INTO [albums] ([id], [title], [release_year], [cover_asset_id], [movie_id], [album_type], [created_at], [updated_at], [is_deleted]) VALUES (3, N'Ponniyin Selvan: Part 1 (Original Soundtrack)', 2022, 26, 3, N'soundtrack', N'2026-11-23 08:24:03', N'2026-11-23 10:15:27', 0);
SET IDENTITY_INSERT [albums] OFF;
GO

-- Seed data for album_artists (3 rows)
INSERT INTO [album_artists] ([album_id], [artist_id]) VALUES (1, 1);
INSERT INTO [album_artists] ([album_id], [artist_id]) VALUES (2, 1);
INSERT INTO [album_artists] ([album_id], [artist_id]) VALUES (3, 2);
GO

-- Seed data for songs (8 rows)
SET IDENTITY_INSERT [songs] ON;
INSERT INTO [songs] ([id], [title], [album_id], [track_number], [duration_seconds], [language_id], [audio_asset_id], [play_count], [mood], [is_published], [created_at], [updated_at], [is_deleted]) VALUES (1, N'Hukum – Thalaivar Alappara', 1, 1, 207, 1, 27, 12500005, N'Energizing', 1, N'2026-11-23 08:24:03', N'2026-11-23 10:15:47', 0);
INSERT INTO [songs] ([id], [title], [album_id], [track_number], [duration_seconds], [language_id], [audio_asset_id], [play_count], [mood], [is_published], [created_at], [updated_at], [is_deleted]) VALUES (2, N'Kaavaalaa', 1, 2, 191, 1, 28, 18200001, N'Festive', 1, N'2026-11-23 08:24:03', N'2026-11-23 10:27:55', 0);
INSERT INTO [songs] ([id], [title], [album_id], [track_number], [duration_seconds], [language_id], [audio_asset_id], [play_count], [mood], [is_published], [created_at], [updated_at], [is_deleted]) VALUES (3, N'Vikram Title Track', 2, 1, 215, 1, 29, 9500001, N'Intense', 1, N'2026-11-23 08:24:03', N'2026-11-23 10:15:27', 0);
INSERT INTO [songs] ([id], [title], [album_id], [track_number], [duration_seconds], [language_id], [audio_asset_id], [play_count], [mood], [is_published], [created_at], [updated_at], [is_deleted]) VALUES (4, N'Pathala Pathala', 2, 2, 211, 1, 30, 14000000, N'Playful', 1, N'2026-11-23 08:24:03', N'2026-11-23 10:15:27', 0);
INSERT INTO [songs] ([id], [title], [album_id], [track_number], [duration_seconds], [language_id], [audio_asset_id], [play_count], [mood], [is_published], [created_at], [updated_at], [is_deleted]) VALUES (5, N'Ponni Nadhi', 3, 1, 295, 1, 31, 7800000, N'Majestic', 1, N'2026-11-23 08:24:03', N'2026-11-23 10:15:27', 0);
INSERT INTO [songs] ([id], [title], [album_id], [track_number], [duration_seconds], [language_id], [audio_asset_id], [play_count], [mood], [is_published], [created_at], [updated_at], [is_deleted]) VALUES (6, N'Chola Chola', 3, 2, 226, 1, 32, 6200000, N'Heroic', 1, N'2026-11-23 08:24:03', N'2026-11-23 10:27:43', 1);
INSERT INTO [songs] ([id], [title], [album_id], [track_number], [duration_seconds], [language_id], [audio_asset_id], [play_count], [mood], [is_published], [created_at], [updated_at], [is_deleted]) VALUES (7, N'Kanave', NULL, NULL, 210, NULL, 33, 0, N'Melodic', 1, N'2026-11-23 10:01:05', N'2026-11-23 10:15:27', 0);
INSERT INTO [songs] ([id], [title], [album_id], [track_number], [duration_seconds], [language_id], [audio_asset_id], [play_count], [mood], [is_published], [created_at], [updated_at], [is_deleted]) VALUES (8, N'Test Song Admin Updated', NULL, NULL, 180, NULL, 34, 0, N'Cinematic', 1, N'2026-11-23 10:25:20', N'2026-11-23 10:25:20', 1);
SET IDENTITY_INSERT [songs] OFF;
GO

-- Seed data for song_artists (8 rows)
INSERT INTO [song_artists] ([song_id], [artist_id], [role]) VALUES (1, 1, N'composer');
INSERT INTO [song_artists] ([song_id], [artist_id], [role]) VALUES (2, 1, N'composer');
INSERT INTO [song_artists] ([song_id], [artist_id], [role]) VALUES (3, 1, N'composer');
INSERT INTO [song_artists] ([song_id], [artist_id], [role]) VALUES (4, 1, N'composer');
INSERT INTO [song_artists] ([song_id], [artist_id], [role]) VALUES (5, 2, N'composer');
INSERT INTO [song_artists] ([song_id], [artist_id], [role]) VALUES (6, 2, N'composer');
INSERT INTO [song_artists] ([song_id], [artist_id], [role]) VALUES (7, 1, N'singer');
INSERT INTO [song_artists] ([song_id], [artist_id], [role]) VALUES (8, 1, N'singer');
GO

-- Seed data for song_genres (6 rows)
INSERT INTO [song_genres] ([song_id], [genre_id]) VALUES (1, 4);
INSERT INTO [song_genres] ([song_id], [genre_id]) VALUES (2, 5);
INSERT INTO [song_genres] ([song_id], [genre_id]) VALUES (3, 7);
INSERT INTO [song_genres] ([song_id], [genre_id]) VALUES (4, 5);
INSERT INTO [song_genres] ([song_id], [genre_id]) VALUES (5, 3);
INSERT INTO [song_genres] ([song_id], [genre_id]) VALUES (6, 1);
GO

-- Seed data for favorites (1 rows)
SET IDENTITY_INSERT [favorites] ON;
INSERT INTO [favorites] ([id], [user_id], [entity_type], [entity_id], [created_at], [updated_at]) VALUES (1, 1, N'song', 7, N'2026-11-23 10:28:11', N'2026-11-23 10:28:11');
SET IDENTITY_INSERT [favorites] OFF;
GO

