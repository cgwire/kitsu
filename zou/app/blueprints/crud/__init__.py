from flask import Blueprint
from zou.app.utils.api import configure_api_from_blueprint

from .person import PersonResource, PersonsResource
from .project import ProjectResource, ProjectsResource
from .task_type import TaskTypesResource, TaskTypeResource
from .task_status import TaskStatusesResource, TaskStatusResource
from .department import DepartmentsResource, DepartmentResource
from .task import TasksResource, TaskResource
from .file_status import FileStatusesResource, FileStatusResource
from .output_file import OutputFilesResource, OutputFileResource
from .output_type import OutputTypeResource, OutputTypesResource
from .software import (
    SoftwaresResource,
    SoftwareResource
)
from .preview_file import (
    PreviewFilesResource,
    PreviewFileResource
)
from .working_file import (
    WorkingFilesResource,
    WorkingFileResource
)
from .project_status import (
    ProjectStatusResource,
    ProjectStatussResource
)
from .entity import EntityResource, EntitiesResource
from .entity_type import (
    EntityTypesResource,
    EntityTypeResource
)
from .comments import CommentsResource, CommentResource
from .time_spent import TimeSpentsResource, TimeSpentResource
from .custom_action import CustomActionsResource, CustomActionResource
from .asset_instance import AssetInstanceResource, AssetInstancesResource
from .playlist import PlaylistsResource, PlaylistResource


routes = [
    ("/data/persons", PersonsResource),
    ("/data/persons/<instance_id>", PersonResource),
    ("/data/projects", ProjectsResource),
    ("/data/projects/<instance_id>", ProjectResource),
    ("/data/project-status", ProjectStatussResource),
    ("/data/project-status/<instance_id>", ProjectStatusResource),
    ("/data/entity-types", EntityTypesResource),
    ("/data/entity-types/<instance_id>", EntityTypeResource),
    ("/data/entities", EntitiesResource),
    ("/data/entities/<instance_id>", EntityResource),
    ("/data/task-types", TaskTypesResource),
    ("/data/task-types/<instance_id>", TaskTypeResource),
    ("/data/task-status", TaskStatusesResource),
    ("/data/task-status/<instance_id>", TaskStatusResource),
    ("/data/tasks", TasksResource),
    ("/data/tasks/<instance_id>", TaskResource),
    ("/data/departments", DepartmentsResource),
    ("/data/departments/<instance_id>", DepartmentResource),
    ("/data/file-status/", FileStatusesResource),
    ("/data/file-status/<instance_id>", FileStatusResource),
    ("/data/softwares", SoftwaresResource),
    ("/data/softwares/<instance_id>", SoftwareResource),
    ("/data/output-files", OutputFilesResource),
    ("/data/output-files/<instance_id>", OutputFileResource),
    ("/data/output-types", OutputTypesResource),
    ("/data/output-types/<instance_id>", OutputTypeResource),
    ("/data/preview-files", PreviewFilesResource),
    ("/data/preview-files/<instance_id>", PreviewFileResource),
    ("/data/working-files", WorkingFilesResource),
    ("/data/working-files/<instance_id>", WorkingFileResource),
    ("/data/comments", CommentsResource),
    ("/data/comments/<instance_id>", CommentResource),
    ("/data/time-spents/", TimeSpentsResource),
    ("/data/time-spents/<instance_id>", TimeSpentResource),
    ("/data/custom-actions/", CustomActionsResource),
    ("/data/custom-actions/<instance_id>", CustomActionResource),
    ("/data/asset-instances/", AssetInstancesResource),
    ("/data/asset-instances/<instance_id>", AssetInstanceResource),
    ("/data/playlists/", PlaylistsResource),
    ("/data/playlists/<instance_id>", PlaylistResource)
]

blueprint = Blueprint("/data", "data")
api = configure_api_from_blueprint(blueprint, routes)
