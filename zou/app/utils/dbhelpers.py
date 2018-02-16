from sqlalchemy import create_engine
from sqlalchemy_utils import database_exists, create_database
from sqlalchemy.engine.url import URL


def get_db_uri():
    from zou.app.config import DATABASE
    return URL(**DATABASE)


def create_all():
    """
    Create all database tables.
    """
    from zou.app import db
    engine = create_engine(get_db_uri())
    if not database_exists(engine.url):
        create_database(engine.url)
    db.create_all()


def drop_all():
    """
    Drop all database tables.
    """
    from zou.app import db
    db.session.flush()
    db.session.close()
    db.drop_all()
