# SONARA – Immersive 3D Music Streaming Ecosystem

Angular web + Ionic/Capacitor mobile + FastAPI + SQL Server + S3-compatible storage.
See `PROJECT_STATUS.md` for exactly what is implemented and verified.

## Quick start
```bash
# 1. Infra (create a root .env with MSSQL_SA_PASSWORD, MINIO_ROOT_USER, MINIO_ROOT_PASSWORD)
docker compose up -d

# 2. Backend
cd backend
python -m venv .venv && source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                                    # edit secrets
pytest -q                                               # unit/API tests (SQLite, no SQL Server needed)
uvicorn app.main:app --reload                           # http://localhost:8000/docs

# 3. Web
cd ../frontend/sonara-web
npm install
npm start                                               # http://localhost:4200 (proxies /api to :8000)
npm test
```
Requires Python 3.11+, Node 20+, Docker, and Microsoft ODBC Driver 18 for SQL Server.
Create an admin: `python -m app.utils.create_admin you@example.com you 'Str0ngPass1'`.
