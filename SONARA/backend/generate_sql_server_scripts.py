import os
import sys
import sqlite3

def generate():
    os.chdir("d:/PersonalProject/SONARA/SONARA/backend")
    sys.path.insert(0, ".")

    from sqlalchemy.schema import CreateTable
    from sqlalchemy.dialects import mssql
    from app.database.base import Base
    from app.models import entities

    schema_file = "d:/PersonalProject/SONARA/SONARA/database/scripts/01_create_tables.sql"
    seed_file = "d:/PersonalProject/SONARA/SONARA/database/scripts/02_seed_data.sql"
    master_file = "d:/PersonalProject/SONARA/SONARA/database/scripts/SONARA_FULL_SETUP.sql"

    # 1. Generate Schema DDL
    with open(schema_file, "w", encoding="utf-8") as f:
        f.write("USE [SONARA];\nGO\n\n")
        for table in Base.metadata.sorted_tables:
            f.write(f"-- Table: {table.name}\n")
            f.write(f"IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = '{table.name}')\nBEGIN\n")
            stmt = CreateTable(table).compile(dialect=mssql.dialect())
            f.write("    " + str(stmt).strip().replace("\n", "\n    ") + ";\nEND\nGO\n\n")

    # 2. Generate Seed Inserts from current populated sqlite
    conn = sqlite3.connect("sonara.db")
    c = conn.cursor()

    tables = [
        "roles", "languages", "genres", "artist_categories", "users", "user_roles",
        "media_assets", "artists", "artist_category_map", "artist_relations",
        "actors", "movies", "movie_actors", "albums", "album_artists",
        "songs", "song_artists", "song_genres", "playlists", "playlist_songs", "favorites"
    ]

    with open(seed_file, "w", encoding="utf-8") as f:
        f.write("USE [SONARA];\nGO\n\n")
        for tbl in tables:
            try:
                rows = c.execute(f"SELECT * FROM {tbl}").fetchall()
            except Exception:
                continue
            if not rows:
                continue
            cols = [d[0] for d in c.description]
            has_id = "id" in cols
            f.write(f"-- Seed data for {tbl} ({len(rows)} rows)\n")
            if has_id:
                f.write(f"SET IDENTITY_INSERT [{tbl}] ON;\n")
            for r in rows:
                vals = []
                for v in r:
                    if v is None:
                        vals.append("NULL")
                    elif isinstance(v, (int, float)):
                        vals.append(str(v))
                    elif isinstance(v, bool):
                        vals.append("1" if v else "0")
                    else:
                        escaped = str(v).replace("'", "''")
                        vals.append(f"N'{escaped}'")
                f.write(f"INSERT INTO [{tbl}] ([{'], ['.join(cols)}]) VALUES ({', '.join(vals)});\n")
            if has_id:
                f.write(f"SET IDENTITY_INSERT [{tbl}] OFF;\n")
            f.write("GO\n\n")

    conn.close()

    # 3. Create Master Setup file
    with open(master_file, "w", encoding="utf-8") as mf:
        mf.write("-- =========================================================================\n")
        mf.write("-- SONARA ECOSYSTEM - COMPLETE SQL SERVER DATABASE SETUP & SEED SCRIPT\n")
        mf.write("-- =========================================================================\n\n")
        with open(schema_file, "r", encoding="utf-8") as sf:
            mf.write(sf.read())
        mf.write("\n-- =========================================================================\n")
        mf.write("-- SEED DATA INSERTS\n")
        mf.write("-- =========================================================================\n\n")
        with open(seed_file, "r", encoding="utf-8") as df:
            mf.write(df.read())

    print("Scripts successfully generated:")
    print(" - database/scripts/01_create_tables.sql")
    print(" - database/scripts/02_seed_data.sql")
    print(" - database/scripts/SONARA_FULL_SETUP.sql")

if __name__ == "__main__":
    generate()
