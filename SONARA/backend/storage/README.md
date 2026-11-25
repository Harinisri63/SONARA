# Storage – development documentation

Dev object storage is MinIO (S3-compatible), started by `docker-compose.yml`.
- API: http://localhost:9000  Console: http://localhost:9001
- Bucket: `sonara-media` (create it in the console or via `mc mb`)
- Key layout: `audio/{songId}/{checksum}.mp3`, `images/{kind}/{id}/{checksum}.jpg`
- SQL Server stores only metadata + `StorageKey` (table `media_assets`). Audio is never stored in the DB.
Production: any S3-compatible service or Azure Blob via the storage service in `backend/app/services/`.
