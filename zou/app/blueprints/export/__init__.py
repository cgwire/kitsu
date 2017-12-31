"""
This module is named source instead of import because import is a Python
keyword.
"""
from flask import Blueprint
from zou.app.utils.api import configure_api_from_blueprint

from .csv.assets import AssetsCsvExport
from .csv.projects import ProjectsCsvExport
from .csv.shots import ShotsCsvExport
from .csv.persons import PersonsCsvExport
from .csv.task_types import TaskTypesCsvExport
from .csv.tasks import TasksCsvExport

routes = [
    ("/export/csv/projects/<project_id>/assets.csv", AssetsCsvExport),
    ("/export/csv/projects/<project_id>/shots.csv", ShotsCsvExport),
    ("/export/csv/persons.csv", PersonsCsvExport),
    ("/export/csv/projects.csv", ProjectsCsvExport),
    ("/export/csv/tasks.csv", TasksCsvExport),
    ("/export/csv/task-types.csv", TaskTypesCsvExport)
]

blueprint = Blueprint("export", "export")
api = configure_api_from_blueprint(blueprint, routes)
