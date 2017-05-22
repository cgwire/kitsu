import os

from zou.app.utils import dbhelpers

APP_NAME = "Unit Image Pipeline API"
APP_SYSTEM_ERROR_SUBJECT_LINE = "%s system error" % APP_NAME

DEBUG = os.getenv('DEBUG', True)

SECRET_KEY = os.getenv("SECRET_KEY", "mysecretkey")
SESSION_COOKIE_NAME = os.getenv("SESSION_NAME", "pipeline-session")
SESSION_TYPE = os.getenv("SESSION_TYPE", "filesystem")
LOGIN_DISABLED = os.getenv("LOGIN_DISABLED", False)

RESTFUL_JSON = {
    "ensure_ascii": False
}

DATABASE = {
    "drivername": os.getenv("DB_DRIVER", "postgres"),
    "host": os.getenv("DB_HOST", "localhost"),
    "port": os.getenv("DB_PORT", "5432"),
    "username": os.getenv("DB_USERNAME", "postgres"),
    "password": os.getenv("DB_PASSWORD", "mysecretpassword"),
    "database": os.getenv("DB_DATABASE", "pipeline")
}
SQLALCHEMY_DATABASE_URI = dbhelpers.get_db_uri()
SQLALCHEMY_TRACK_MODIFICATIONS = True

NB_RECORDS_PER_PAGE = 100

WIP_TASK_STATUS = "WIP"
TO_REVIEW_TASK_STATUS = "To review"
DEFAULT_FILE_STATUS = "To review"


DEFAULT_FILE_TREE = os.getenv("DEFAULT_FILE_TREE", "standard")
FILE_TREE_FOLDER = os.getenv(
    "FILE_TREE_FOLDER",
    os.path.join(os.getcwd(), "file_trees")
)
THUMBNAIL_FOLDER = os.getenv(
    "THUMBNAIL_FOLDER",
    os.path.join(os.getcwd(), "thumbnails")
)
EVENT_HANDLERS_FOLDER = os.getenv(
    "EVENT_HANDLERS_FOLDER",
    os.path.join(os.getcwd(), "event_handlers")
)
TMP_DIR = os.getenv("TMP_DIR", os.path.join(os.sep, "tmp"))
