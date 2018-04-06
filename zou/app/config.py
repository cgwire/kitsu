import os
import datetime

from zou.app.utils import dbhelpers

APP_NAME = "Zou"
APP_SYSTEM_ERROR_SUBJECT_LINE = "%s system error" % APP_NAME

DEBUG = os.getenv("DEBUG", True)
SECRET_KEY = os.getenv("SECRET_KEY", "mysecretkey")

AUTH_STRATEGY = os.getenv("AUTH_STRATEGY", "auth_local_classic")

KEY_VALUE_STORE = {
  "host": os.getenv("KV_HOST", "localhost"),
  "port": os.getenv("KV_PORT", "6379"),
}
AUTH_TOKEN_BLACKLIST_KV_INDEX = 0
MEMOIZE_DB_INDEX = 1
KV_EVENTS_DB_INDEX = 2
KV_JOB_DB_INDEX = 3

ENABLE_JOB_QUEUE = os.getenv("ENABLE_JOB_QUEUE", False)

JWT_BLACKLIST_ENABLED = True
JWT_BLACKLIST_TOKEN_CHECKS = ["access", "refresh"]
JWT_ACCESS_TOKEN_EXPIRES = datetime.timedelta(days=7)
JWT_REFRESH_TOKEN_EXPIRES = datetime.timedelta(days=15)
JWT_TOKEN_LOCATION = ['cookies', 'headers']
JWT_REFRESH_COOKIE_PATH = '/auth/refresh-token'
JWT_COOKIE_CSRF_PROTECT = False
JWT_SESSION_COOKIE = False

RESTFUL_JSON = {
    "ensure_ascii": False
}
DATABASE = {
    "drivername": os.getenv("DB_DRIVER", "postgres"),
    "host": os.getenv("DB_HOST", "localhost"),
    "port": os.getenv("DB_PORT", "5432"),
    "username": os.getenv("DB_USERNAME", "postgres"),
    "password": os.getenv("DB_PASSWORD", "mysecretpassword"),
    "database": os.getenv("DB_DATABASE", "zoudb")
}
SQLALCHEMY_DATABASE_URI = str(dbhelpers.get_db_uri())
SQLALCHEMY_TRACK_MODIFICATIONS = True

NB_RECORDS_PER_PAGE = 100

DONE_TASK_STATUS = "Done"
WIP_TASK_STATUS = "WIP"
TO_REVIEW_TASK_STATUS = "To review"
DEFAULT_FILE_STATUS = "To review"

DEFAULT_FILE_TREE = os.getenv("DEFAULT_FILE_TREE", "default")
FILE_TREE_FOLDER = os.getenv("FILE_TREE_FOLDER")
THUMBNAIL_FOLDER = os.getenv("THUMBNAIL_FOLDER")

EVENT_HANDLERS_FOLDER = os.getenv(
    "EVENT_HANDLERS_FOLDER",
    os.path.join(os.getcwd(), "event_handlers")
)
TMP_DIR = os.getenv("TMP_DIR", os.path.join(os.sep, "tmp"))
