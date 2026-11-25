"""Create an admin user:  python -m app.utils.create_admin you@example.com yourname 'Str0ngPass'"""
import sys

from app.core.security import hash_password
from app.database.session import get_db
from app.features.authentication.repository import AuthRepository


def main(email: str, username: str, password: str) -> None:
    gen = get_db(); db = next(gen)
    repo = AuthRepository(db)
    admin, user = repo.get_or_create_role("Admin"), repo.get_or_create_role("User")
    u = repo.create_user(email=email.lower(), username=username, full_name=username,
                         password_hash=hash_password(password), role=user)
    from app.models import UserRole
    db.add(UserRole(user_id=u.id, role_id=admin.id))
    db.commit(); print(f"Admin created: {email}")


if __name__ == "__main__":
    if len(sys.argv) != 4:
        sys.exit(__doc__)
    main(*sys.argv[1:])
