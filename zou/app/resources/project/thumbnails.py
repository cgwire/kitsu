from flask import abort, request, send_from_directory
from flask_restful import Resource
from flask_login import login_required

from zou.app.project import (
    shot_info,
    file_info,
    person_info,
    asset_info,
    project_info
)
from zou.app.utils import thumbnail as thumbnail_utils


class BaseCreateThumbnailResource(Resource):

    def __init__(self, data_type, size=thumbnail_utils.RECTANGLE_SIZE):
        Resource.__init__(self)
        self.data_type = data_type
        self.size = size

    @login_required
    def post(self, instance_id):
        if not self.is_exist(instance_id):
            abort(404)

        uploaded_file = request.files["file"]
        print(self.size)
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

        return result, 201


class BaseThumbnailResource(Resource):

    def __init__(self, data_type):
        Resource.__init__(self)
        self.data_type = data_type

    @login_required
    def get(self, instance_id):
        if not self.is_exist(instance_id):
            abort(404)

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
        return person_info.get_person(person_id) is not None


class PersonThumbnailResource(BaseThumbnailResource):

    def __init__(self):
        BaseThumbnailResource.__init__(
            self,
            "persons"
        )

    def is_exist(self, person_id):
        return person_info.get_person(person_id) is not None


class CreateProjectThumbnailResource(BaseCreateThumbnailResource):

    def __init__(self):
        BaseCreateThumbnailResource.__init__(
            self,
            "projects",
            thumbnail_utils.SQUARE_SIZE
        )

    def is_exist(self, project_id):
        return project_info.get_project(project_id) is not None


class ProjectThumbnailResource(BaseThumbnailResource):

    def __init__(self):
        BaseThumbnailResource.__init__(self, "projects")

    def is_exist(self, project_id):
        return project_info.get_project(project_id) is not None


class CreateShotThumbnailResource(BaseCreateThumbnailResource):

    def __init__(self):
        BaseCreateThumbnailResource.__init__(self, "shots")

    def is_exist(self, shot_id):
        return shot_info.get_shot(shot_id) is not None


class ShotThumbnailResource(BaseThumbnailResource):

    def __init__(self):
        BaseThumbnailResource.__init__(self, "shots")

    def is_exist(self, shot_id):
        return shot_info.get_shot(shot_id) is not None


class CreateAssetThumbnailResource(BaseCreateThumbnailResource):

    def __init__(self):
        BaseCreateThumbnailResource.__init__(self, "assets")

    def is_exist(self, asset_id):
        return asset_info.get_asset(asset_id) is not None


class AssetThumbnailResource(BaseThumbnailResource):

    def __init__(self):
        BaseThumbnailResource.__init__(self, "assets")

    def is_exist(self, asset_id):
        return asset_info.get_asset(asset_id) is not None


class CreateWorkingFileThumbnailResource(BaseCreateThumbnailResource):

    def __init__(self):
        BaseCreateThumbnailResource.__init__(self, "working_files")

    def is_exist(self, working_file_id):
        return file_info.get_working_file(working_file_id) is not None


class WorkingFileThumbnailResource(BaseThumbnailResource):

    def __init__(self):
        BaseThumbnailResource.__init__(self, "working_files")

    def is_exist(self, working_file_id):
        return file_info.get_working_file(working_file_id) is not None


class CreatePreviewFileThumbnailResource(BaseCreateThumbnailResource):

    def __init__(self):
        BaseCreateThumbnailResource.__init__(
            self,
            "preview-files",
            thumbnail_utils.PREVIEW_SIZE
        )

    def is_exist(self, preview_file_id):
        return file_info.get_preview_file(preview_file_id) is not None


class PreviewFileThumbnailResource(BaseThumbnailResource):

    def __init__(self):
        BaseThumbnailResource.__init__(self, "preview-files")

    def is_exist(self, preview_file_id):
        print(preview_file_id)
        return file_info.get_preview_file(preview_file_id) is not None
