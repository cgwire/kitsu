from flask import Blueprint

from zou.app.utils.api import configure_api_from_blueprint

from .asset_instance import AssetInstanceResource, AssetInstancesResource
from .comments import CommentsResource, CommentResource
from .custom_action import CustomActionsResource, CustomActionResource
from .department import DepartmentsResource, DepartmentResource
from .entity import EntityResource, EntitiesResource
from .entity_type import EntityTypesResource, EntityTypeResource
from .event import EventsResource, EventResource
from .file_status import FileStatusesResource, FileStatusResource
from .metadata_descriptor import (
    MetadataDescriptorsResource,
    MetadataDescriptorResource
)
from .milestone import MilestonesResource, MilestoneResource
from .notification import NotificationsResource, NotificationResource
from .organisation import OrganisationsResource, OrganisationResource
from .output_file import OutputFilesResource, OutputFileResource
from .output_type import OutputTypeResource, OutputTypesResource
from .news import NewssResource, NewsResource
from .person import PersonResource, PersonsResource
from .preview_file import PreviewFilesResource, PreviewFileResource
from .playlist import PlaylistsResource, PlaylistResource
from .project import ProjectResource, ProjectsResource
from .project_status import ProjectStatusResource, ProjectStatussResource
from .schedule_item import ScheduleItemsResource, ScheduleItemResource
from .subscription import SubscriptionsResource, SubscriptionResource
from .search_filter import SearchFiltersResource, SearchFilterResource
from .software import SoftwaresResource, SoftwareResource
from .task_type import TaskTypesResource, TaskTypeResource
from .task_status import TaskStatusesResource, TaskStatusResource
from .task import TasksResource, TaskResource
from .time_spent import TimeSpentsResource, TimeSpentResource
from .working_file import WorkingFilesResource, WorkingFileResource


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
    ("/data/organisations", OrganisationsResource),
    ("/data/organisations/<instance_id>", OrganisationResource),
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
    ("/data/playlists/<instance_id>", PlaylistResource),
    ("/data/events/", EventsResource),
    ("/data/events/<instance_id>", EventResource),
    ("/data/notifications/", NotificationsResource),
    ("/data/notifications/<instance_id>", NotificationResource),
    ("/data/search-filters/", SearchFiltersResource),
    ("/data/search-filters/<instance_id>", SearchFilterResource),
    ("/data/schedule-items/", ScheduleItemsResource),
    ("/data/schedule-items/<instance_id>", ScheduleItemResource),
    ("/data/news/", NewssResource),
    ("/data/news/<instance_id>", NewsResource),
    ("/data/milestones/", MilestonesResource),
    ("/data/milestones/<instance_id>", MilestoneResource),
    ("/data/metadata-descriptors/", MetadataDescriptorsResource),
    ("/data/metadata-descriptors/<instance_id>", MetadataDescriptorResource),
    ("/data/subscriptions/", SubscriptionsResource),
    ("/data/subscriptions/<instance_id>", SubscriptionResource),
]

blueprint = Blueprint("/data", "data")
api = configure_api_from_blueprint(blueprint, routes)
