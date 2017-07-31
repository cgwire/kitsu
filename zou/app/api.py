import sys

from flask_restful import Api, output_json
from flask_login import LoginManager, AnonymousUserMixin

from zou.app.utils import events, auth

from .resources.index import IndexResource
from .resources.project.assets import (
    AllAssetsResource,
    AssetsAndTasksResource,
    AssetTypesResource,
    NewAssetResource,
    RemoveAssetResource,
    ProjectAssetsResource,
    ProjectAssetTypeAssetsResource,
    AssetTasksResource
)
from .resources.project.shots import (
    ShotsResource,
    ShotsAndTasksResource,
    ShotAssetsResource,
    ShotTaskTypesResource,
    ShotTasksResource,
    ProjectShotsResource,
    ProjectSequencesResource,
    ProjectEpisodesResource
)
from .resources.project.episodes import (
    EpisodesResource,
    EpisodeSequencesResource
)
from .resources.project.sequences import (
    SequencesResource,
    SequenceShotsResource
)
from .resources.project.projects import AllProjectsResource
from .resources.project.task_full import TaskFullResource
from .resources.project.task_assign import TaskAssignResource
from .resources.project.task_start import (
    TaskStartResource,
    StartTaskFromShotAssetResource
)
from .resources.project.tasks import (
    CommentTaskResource,
    TaskCommentsResource
)
from .resources.project.files import (
    FolderPathResource,
    FilePathResource,
    SetTreeResource,
    GetTaskFromPathResource
)
from .resources.project.working_files import (
    CommentWorkingFileResource,
    PublishFileResource,
    GetNextOutputFileResource
)
from .resources.project.thumbnails import (
    CreateShotThumbnailResource,
    ShotThumbnailResource,
    CreateProjectThumbnailResource,
    ProjectThumbnailResource,
    CreatePersonThumbnailResource,
    PersonThumbnailResource,
    CreateWorkingFileThumbnailResource,
    WorkingFileThumbnailResource
)
from .resources.project.projects import OpenProjectsResource

from .resources.source.shotgun.project import (
    ImportShotgunProjectsResource,
    ImportRemoveShotgunProjectResource
)
from .resources.source.shotgun.person import (
    ImportShotgunPersonsResource,
    ImportRemoveShotgunPersonResource
)
from .resources.source.shotgun.shot import (
    ImportShotgunShotsResource,
    ImportRemoveShotgunShotResource
)
from .resources.source.shotgun.sequence import (
    ImportShotgunSequencesResource,
    ImportRemoveShotgunSequenceResource
)
from .resources.source.shotgun.assets import (
    ImportShotgunAssetsResource,
    ImportRemoveShotgunAssetResource
)
from .resources.source.shotgun.steps import (
    ImportShotgunStepsResource,
    ImportRemoveShotgunStepResource
)
from .resources.source.shotgun.status import (
    ImportShotgunStatusResource,
    ImportRemoveShotgunStatusResource
)
from .resources.source.shotgun.tasks import (
    ImportShotgunTasksResource,
    ImportRemoveShotgunTaskResource
)
from .resources.source.shotgun.versions import (
    ImportShotgunVersionsResource,
    ImportRemoveShotgunVersionResource
)
from .resources.source.shotgun.import_errors import (
    ShotgunImportErrorsResource,
    ShotgunImportErrorResource
)
from .resources.source.shotgun.notes import (
    ImportShotgunNotesResource,
    ImportRemoveShotgunNoteResource
)

from .resources.source.csv.projects import ProjectsCsvImportResource
from .resources.source.csv.persons import PersonsCsvImportResource
from .resources.source.csv.assets import AssetsCsvImportResource
from .resources.source.csv.shots import ShotsCsvImportResource
from .resources.source.csv.tasks import TasksCsvImportResource

from .resources.export.csv.assets import AssetsCsvExport
from .resources.export.csv.projects import ProjectsCsvExport
from .resources.export.csv.shots import ShotsCsvExport
from .resources.export.csv.persons import PersonsCsvExport
from .resources.export.csv.task_types import TaskTypesCsvExport
from .resources.export.csv.tasks import TasksCsvExport

from .resources.data.person import PersonResource, PersonsResource
from .resources.data.project import ProjectResource, ProjectsResource
from .resources.data.task_type import TaskTypesResource, TaskTypeResource
from .resources.data.task_status import TaskStatusesResource, TaskStatusResource
from .resources.data.department import DepartmentsResource, DepartmentResource
from .resources.data.task import TasksResource, TaskResource
from .resources.data.file_status import FileStatusesResource, FileStatusResource
from .resources.data.output_file import OutputFilesResource, OutputFileResource
from .resources.data.preview_file import (
    PreviewFilesResource,
    PreviewFileResource
)
from .resources.data.working_file import (
    WorkingFilesResource,
    WorkingFileResource
)
from .resources.data.project_status import (
    ProjectStatusResource,
    ProjectStatussResource
)
from .resources.data.entity import EntityResource, EntitiesResource
from .resources.data.entity_type import (
    EntityTypesResource,
    EntityTypeResource
)
from .resources.data.comments import CommentsResource, CommentResource

from .resources.auth import (
    LoginResource,
    LogoutResource,
    AuthenticatedResource,
    ChangePasswordResource,
    RegistrationResource
)


def configure(app):
    """
    Turn Flask app into a REST API. It configures routes and error management.
    """
    api = configure_api_behavior(app)
    app.url_map.strict_slashes = False
    configure_api_routes(api)
    register_event_handlers(app)
    configure_auth(app)


def configure_api_behavior(app):
    """
    Tell to Flask what to return in case of error and make sure that only JSON
    is returned.
    """
    errors = {
        'ProgrammingError': {
            'message': 'Server error occured. Make sure that you init the '
                       'database.',
        },
        'IntegrityError': {
            'message': 'Wrong data, make sure that evey fields are present.',
            'status': 400
        },
        'ValueError': {
            'message': 'Wrong data format in your filter.',
            'status': 400
        },
        'WrongDataSentException': {
            'message': 'Wrong data format sent as body of your request.',
            'status': 400
        }
    }
    api = Api(app, catch_all_404s=True, errors=errors)

    api.representations = {
        'application/json; charset=utf-8': output_json,
        'application/json': output_json,
    }

    return api


def configure_api_routes(api):

    # Info routes
    api.add_resource(IndexResource, "/")

    # Shot routes
    api.add_resource(ShotsResource, "/data/shots/all")
    api.add_resource(SequencesResource, "/data/sequences")
    api.add_resource(EpisodesResource, "/data/episodes")
    api.add_resource(
        SequenceShotsResource,
        "/data/sequences/<instance_id>/shots"
    )
    api.add_resource(
        EpisodeSequencesResource,
        "/data/episodes/<instance_id>/sequences"
    )
    api.add_resource(
        ShotAssetsResource,
        "/data/shots/<instance_id>/assets"
    )
    api.add_resource(
        ShotTaskTypesResource,
        "/data/shots/<instance_id>/task_types"
    )
    api.add_resource(
        ShotTasksResource,
        "/data/shots/<instance_id>/tasks"
    )
    api.add_resource(
        ShotsAndTasksResource,
        "/data/shots/with-tasks"
    )

    # Asset routes
    api.add_resource(AssetTypesResource, "/data/asset_types")
    api.add_resource(
        AllAssetsResource,
        "/data/assets/all"
    )
    api.add_resource(
        AssetTasksResource,
        "/data/assets/<instance_id>/tasks"
    )
    api.add_resource(
        AssetsAndTasksResource,
        "/data/assets/with-tasks"
    )

    # Task routes
    api.add_resource(TaskFullResource, "/data/tasks/<instance_id>/full")
    api.add_resource(CommentTaskResource, "/project/tasks/<task_id>/comment")
    api.add_resource(TaskCommentsResource, "/data/tasks/<task_id>/comments")
    api.add_resource(TaskAssignResource, "/data/tasks/<instance_id>/assign")
    api.add_resource(TaskStartResource, "/data/tasks/<instance_id>/start")
    api.add_resource(
        StartTaskFromShotAssetResource,
        "/data/tasks/task-type/<task_type_id>/entity/<entity_id>/start"
    )

    # Project routes
    api.add_resource(OpenProjectsResource, "/data/projects/open")
    api.add_resource(AllProjectsResource, "/data/projects/all")
    api.add_resource(
        ProjectAssetsResource,
        "/data/projects/<project_id>/assets"
    )
    api.add_resource(
        ProjectAssetTypeAssetsResource,
        "/data/projects/<project_id>/asset_types/<asset_type_id>/assets"
    )
    api.add_resource(
        NewAssetResource,
        "/data/projects/<project_id>/asset-types/<asset_type_id>/assets/new"
    )
    api.add_resource(
        RemoveAssetResource,
        "/data/projects/<project_id>/asset-types/<asset_type_id>/"
        "assets/<asset_id>"
    )
    api.add_resource(
        ProjectShotsResource,
        "/data/projects/<project_id>/shots"
    )
    api.add_resource(
        ProjectSequencesResource,
        "/data/projects/<project_id>/sequences"
    )
    api.add_resource(
        ProjectEpisodesResource,
        "/data/projects/<project_id>/episodes"
    )

    # File routes
    api.add_resource(SetTreeResource, "/project/<project_id>/set-tree")
    api.add_resource(FolderPathResource, "/project/tree/folder")
    api.add_resource(FilePathResource, "/project/tree/file")
    api.add_resource(
        CommentWorkingFileResource,
        "/project/files/working-files/<working_file_id>/comment"
    )
    api.add_resource(
        PublishFileResource,
        "/project/files/working-files/publish"
    )
    api.add_resource(
        GetTaskFromPathResource,
        "/project/tasks/from-path"
    )
    api.add_resource(
        GetNextOutputFileResource,
        "/project/tasks/<task_id>/output_files/next-revision"
    )

    # Thumbnail routes
    api.add_resource(
        CreateShotThumbnailResource,
        "/thumbnails/shots/<instance_id>"
    )
    api.add_resource(
        ShotThumbnailResource,
        "/thumbnails/shots/<instance_id>.png"
    )
    api.add_resource(
        CreatePersonThumbnailResource,
        "/thumbnails/persons/<instance_id>"
    )
    api.add_resource(
        PersonThumbnailResource,
        "/thumbnails/persons/<instance_id>.png"
    )
    api.add_resource(
        CreateProjectThumbnailResource,
        "/thumbnails/projects/<instance_id>"
    )
    api.add_resource(
        ProjectThumbnailResource,
        "/thumbnails/projects/<instance_id>.png"
    )
    api.add_resource(
        CreateWorkingFileThumbnailResource,
        "/thumbnails/working-files/<instance_id>"
    )
    api.add_resource(
        WorkingFileThumbnailResource,
        "/thumbnails/working-files/<instance_id>.png"
    )

    # Shotgun Import routes
    api.add_resource(
        ImportShotgunProjectsResource, "/data/import/shotgun/projects")
    api.add_resource(
        ImportShotgunPersonsResource, "/data/import/shotgun/persons")
    api.add_resource(
        ImportShotgunShotsResource, "/data/import/shotgun/shots")
    api.add_resource(
        ImportShotgunSequencesResource, "/data/import/shotgun/sequences")
    api.add_resource(
        ImportShotgunAssetsResource, "/data/import/shotgun/assets")
    api.add_resource(
        ImportShotgunStepsResource, "/data/import/shotgun/steps")
    api.add_resource(
        ImportShotgunStatusResource, "/data/import/shotgun/status")
    api.add_resource(
        ImportShotgunTasksResource, "/data/import/shotgun/tasks")
    api.add_resource(
        ImportShotgunVersionsResource, "/data/import/shotgun/versions")
    api.add_resource(
        ImportShotgunNotesResource, "/data/import/shotgun/notes")
    api.add_resource(
        ShotgunImportErrorsResource, "/data/import/shotgun/errors")
    api.add_resource(
        ShotgunImportErrorResource, "/data/import/shotgun/errors/<error_id>")

    api.add_resource(
        ImportRemoveShotgunProjectResource,
        "/data/import/shotgun/remove/project"
    )
    api.add_resource(
        ImportRemoveShotgunPersonResource, "/data/import/shotgun/remove/person")
    api.add_resource(
        ImportRemoveShotgunShotResource, "/data/import/shotgun/remove/shot")
    api.add_resource(
        ImportRemoveShotgunSequenceResource,
        "/data/import/shotgun/remove/sequence"
    )
    api.add_resource(
        ImportRemoveShotgunAssetResource, "/data/import/shotgun/remove/asset")
    api.add_resource(
        ImportRemoveShotgunStepResource, "/data/import/shotgun/remove/step")
    api.add_resource(
        ImportRemoveShotgunStatusResource, "/data/import/shotgun/remove/status")
    api.add_resource(
        ImportRemoveShotgunTaskResource, "/data/import/shotgun/remove/task")
    api.add_resource(
        ImportRemoveShotgunNoteResource, "/data/import/shotgun/remove/note")
    api.add_resource(
        ImportRemoveShotgunVersionResource,
        "/data/import/shotgun/remove/version"
    )

    # CSV Import
    api.add_resource(ProjectsCsvImportResource, "/data/import/csv/projects")
    api.add_resource(PersonsCsvImportResource, "/data/import/csv/persons")
    api.add_resource(AssetsCsvImportResource, "/data/import/csv/assets")
    api.add_resource(ShotsCsvImportResource, "/data/import/csv/shots")
    api.add_resource(TasksCsvImportResource, "/data/import/csv/tasks")

    # Export
    api.add_resource(ProjectsCsvExport, "/export/csv/projects.csv")
    api.add_resource(ShotsCsvExport, "/export/csv/shots.csv")
    api.add_resource(AssetsCsvExport, "/export/csv/assets.csv")
    api.add_resource(PersonsCsvExport, "/export/csv/persons.csv")
    api.add_resource(TasksCsvExport, "/export/csv/tasks.csv")
    api.add_resource(TaskTypesCsvExport, "/export/csv/task-types.csv")

    # Models routes
    api.add_resource(PersonsResource, "/data/persons")
    api.add_resource(PersonResource, "/data/persons/<instance_id>")
    api.add_resource(ProjectsResource, "/data/projects")
    api.add_resource(ProjectResource, "/data/projects/<instance_id>")
    api.add_resource(ProjectStatussResource, "/data/project_status")
    api.add_resource(
        ProjectStatusResource,
        "/data/project_status/<instance_id>"
    )
    api.add_resource(EntityTypesResource, "/data/entity_types")
    api.add_resource(EntityTypeResource, "/data/entity_types/<instance_id>")
    api.add_resource(EntitiesResource, "/data/entities")
    api.add_resource(EntityResource, "/data/entities/<instance_id>")
    api.add_resource(TaskTypesResource, "/data/task_types")
    api.add_resource(
        TaskTypeResource,
        "/data/task_types/<instance_id>"
    )
    api.add_resource(TaskStatusesResource, "/data/task_status")
    api.add_resource(TaskStatusResource, "/data/task_status/<instance_id>")
    api.add_resource(TasksResource, "/data/tasks")
    api.add_resource(TaskResource, "/data/tasks/<instance_id>")
    api.add_resource(DepartmentsResource, "/data/departments")
    api.add_resource(DepartmentResource, "/data/departments/<instance_id>")
    api.add_resource(FileStatusesResource, "/data/file_status/")
    api.add_resource(FileStatusResource, "/data/file_status/<instance_id>")
    api.add_resource(OutputFilesResource, "/data/output_files")
    api.add_resource(OutputFileResource, "/data/output_files/<instance_id>")
    api.add_resource(PreviewFilesResource, "/data/preview_files")
    api.add_resource(PreviewFileResource, "/data/preview_files/<instance_id>")
    api.add_resource(WorkingFilesResource, "/data/working_files")
    api.add_resource(WorkingFileResource, "/data/working_files/<instance_id>")
    api.add_resource(CommentsResource, "/data/comments")
    api.add_resource(CommentResource, "/data/comments/<instance_id>")

    api.add_resource(LoginResource, "/auth/login")
    api.add_resource(LogoutResource, "/auth/logout")
    api.add_resource(AuthenticatedResource, "/auth/authenticated")
    api.add_resource(RegistrationResource, "/auth/register")
    api.add_resource(ChangePasswordResource, "/auth/change-password")

    return api


def register_event_handlers(app):
    sys.path.append(app.config["EVENT_HANDLERS_FOLDER"])
    import event_handlers
    events.register_all(event_handlers.event_map)


def configure_auth(app):
    login_manager = LoginManager()
    login_manager.init_app(app)

    class AnonymousUser(AnonymousUserMixin):
        def to_dict(self):
            return {"anonynous": True}

    login_manager.anonymous_user = AnonymousUser

    @login_manager.user_loader
    def load_user(user_id):
        return auth.load_user(user_id)
