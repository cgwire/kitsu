from flask import abort, request, send_from_directory
from flask_restful import Resource
from flask_jwt_extended import jwt_required

from zou.app.services import (
    shots_service,
    files_service,
    persons_service,
    assets_service,
    projects_service,
    tasks_service,
    user_service
)
from zou.app.utils import thumbnail as thumbnail_utils, permissions


class BaseCreateThumbnailResource(Resource):

    def __init__(self, data_type, size=thumbnail_utils.RECTANGLE_SIZE):
        Resource.__init__(self)
        self.data_type = data_type
        self.size = size

    @jwt_required
    def post(self, instance_id):
        if not self.is_exist(instance_id):
            abort(404)

        try:
            permissions.check_admin_permissions()
            uploaded_file = request.files["file"]
            thumbnail_utils.save_file(
                self.data_type,
                instance_id,
                uploaded_file,
                size=self.size
            )

            thumbnail_url_path = \
                thumbnail_utils.url_path(
                    self.data_type,
                    instance_id
                )

            result = {"thumbnail_path": thumbnail_url_path}
        except permissions.PermissionDenied:
            abort(403)

        return result, 201


class BaseThumbnailResource(Resource):

    def __init__(self, data_type):
        Resource.__init__(self)
        self.data_type = data_type

    def is_allowed(self, instance_id):
        return True

    @jwt_required
    def get(self, instance_id):
        if not self.is_exist(instance_id):
            abort(404)

        if not self.is_allowed(instance_id):
            abort(403)

        return send_from_directory(
            directory=thumbnail_utils.get_folder_name(self.data_type),
            filename=thumbnail_utils.get_file_name(instance_id)
        )


class CreatePersonThumbnailResource(BaseCreateThumbnailResource):

    def __init__(self):
        BaseCreateThumbnailResource.__init__(
            self,
            "persons",
            thumbnail_utils.SQUARE_SIZE
        )

    def is_exist(self, person_id):
        return persons_service.get_person(person_id) is not None


class PersonThumbnailResource(BaseThumbnailResource):

    def __init__(self):
        BaseThumbnailResource.__init__(
            self,
            "persons"
        )

    def is_exist(self, person_id):
        return persons_service.get_person(person_id) is not None


class CreateProjectThumbnailResource(BaseCreateThumbnailResource):

    def __init__(self):
        BaseCreateThumbnailResource.__init__(
            self,
            "projects",
            thumbnail_utils.SQUARE_SIZE
        )

    def is_exist(self, project_id):
        return projects_service.get_project(project_id) is not None


class ProjectThumbnailResource(BaseThumbnailResource):

    def __init__(self):
        BaseThumbnailResource.__init__(self, "projects")

    def is_exist(self, project_id):
        return projects_service.get_project(project_id) is not None

    def is_allowed(self, project_id):
        try:
            if not permissions.has_manager_permissions():
                user_service.check_has_task_related(project_id)
            return True
        except permissions.PermissionDenied:
            return False


class CreateShotThumbnailResource(BaseCreateThumbnailResource):

    def __init__(self):
        BaseCreateThumbnailResource.__init__(self, "shots")

    def is_exist(self, shot_id):
        return shots_service.get_shot(shot_id) is not None


class ShotThumbnailResource(BaseThumbnailResource):

    def __init__(self):
        BaseThumbnailResource.__init__(self, "shots")

    def is_exist(self, shot_id):
        return shots_service.get_shot(shot_id) is not None

    def is_allowed(self, shot_id):
        shot = shots_service.get_shot(shot_id)
        try:
            if not permissions.has_manager_permissions():
                user_service.check_has_task_related(shot.project_id)
            return True
        except permissions.PermissionDenied:
            return False


class CreateAssetThumbnailResource(BaseCreateThumbnailResource):

    def __init__(self):
        BaseCreateThumbnailResource.__init__(self, "assets")

    def is_exist(self, asset_id):
        return assets_service.get_asset(asset_id) is not None


class AssetThumbnailResource(BaseThumbnailResource):

    def __init__(self):
        BaseThumbnailResource.__init__(self, "assets")

    def is_exist(self, asset_id):
        return assets_service.get_asset(asset_id) is not None

    def is_allowed(self, asset_id):
        asset = assets_service.get_asset(asset_id)
        try:
            if not permissions.has_manager_permissions():
                user_service.check_has_task_related(asset.project_id)
            return True
        except permissions.PermissionDenied:
            return False


class CreateWorkingFileThumbnailResource(BaseCreateThumbnailResource):

    def __init__(self):
        BaseCreateThumbnailResource.__init__(self, "working_files")

    def is_exist(self, working_file_id):
        return files_service.get_working_file(working_file_id) is not None


class WorkingFileThumbnailResource(BaseThumbnailResource):

    def __init__(self):
        BaseThumbnailResource.__init__(self, "working_files")

    def is_exist(self, working_file_id):
        return files_service.get_working_file(working_file_id) is not None

    def is_allowed(self, working_file_id):
        working_file = files_service.get_working_file(working_file_id)
        task = tasks_service.get_task(working_file.task_id)
        try:
            if not permissions.has_manager_permissions():
                user_service.check_has_task_related(task.project_id)
            return True
        except permissions.PermissionDenied:
            return False


class CreatePreviewFileThumbnailResource(BaseCreateThumbnailResource):

    def __init__(self):
        BaseCreateThumbnailResource.__init__(
            self,
            "preview-files",
            thumbnail_utils.PREVIEW_SIZE
        )

    def is_exist(self, preview_file_id):
        return files_service.get_preview_file(preview_file_id) is not None


class PreviewFileThumbnailResource(BaseThumbnailResource):

    def __init__(self):
        BaseThumbnailResource.__init__(self, "preview-files")

    def is_exist(self, preview_file_id):
        return files_service.get_preview_file(preview_file_id) is not None

    def is_allowed(self, preview_file_id):
        preview_file = files_service.get_preview_file(preview_file_id)
        task = tasks_service.get_task(preview_file.task_id)
        try:
            if not permissions.has_manager_permissions():
                user_service.check_has_task_related(task.project_id)
            return True
        except permissions.PermissionDenied:
            return False
