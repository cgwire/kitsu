import sys

from zou.app.utils import events

from .blueprints.assets import blueprint as assets_blueprint
from .blueprints.auth import blueprint as auth_blueprint
from .blueprints.crud import blueprint as crud_blueprint
from .blueprints.files import blueprint as files_blueprint
from .blueprints.export import blueprint as export_blueprint
from .blueprints.source import blueprint as import_blueprint
from .blueprints.index import blueprint as index_blueprint
from .blueprints.persons import blueprint as persons_blueprint
from .blueprints.playlists import blueprint as playlists_blueprint
from .blueprints.projects import blueprint as projects_blueprint
from .blueprints.shots import blueprint as shots_blueprint
from .blueprints.tasks import blueprint as tasks_blueprint
from .blueprints.thumbnails import blueprint as thumbnails_blueprint
from .blueprints.user import blueprint as user_blueprint


def configure(app):
    """
    Turn Flask app into a REST API. It configures routes, auth and events
    system.
    """
    app.url_map.strict_slashes = False
    configure_api_routes(app)
    register_event_handlers(app)
    return app


def configure_api_routes(app):
    """
    Register blueprints (modules). Each blueprint describe routes and
    associated resources (controllers).
    """
    app.register_blueprint(auth_blueprint)
    app.register_blueprint(assets_blueprint)
    app.register_blueprint(crud_blueprint)
    app.register_blueprint(export_blueprint)
    app.register_blueprint(files_blueprint)
    app.register_blueprint(import_blueprint)
    app.register_blueprint(index_blueprint)
    app.register_blueprint(persons_blueprint)
    app.register_blueprint(playlists_blueprint)
    app.register_blueprint(projects_blueprint)
    app.register_blueprint(shots_blueprint)
    app.register_blueprint(tasks_blueprint)
    app.register_blueprint(thumbnails_blueprint)
    app.register_blueprint(user_blueprint)
    return app


def register_event_handlers(app):
    """
    Load code from event handlers folder. Then it registers in the event manager
    each event handler listed in the __init_.py.
    """
    sys.path.insert(0, app.config["EVENT_HANDLERS_FOLDER"])
    try:
        import event_handlers
        events.register_all(event_handlers.event_map)
    except ImportError:
        # Event handlers folder is not properly configured.
        # Handlers are optional, that's why this error is ignored.
        pass

    return app
