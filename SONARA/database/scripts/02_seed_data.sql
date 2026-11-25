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

