import os

from flask import abort, request, send_file, current_app
from flask_restful import Resource
from flask_jwt_extended import jwt_required

from zou.app.stores import file_store
from zou.app.services import (
    files_service,
    persons_service,
    projects_service,
    tasks_service,
    user_service,
    entities_service
)
from zou.app.utils import (
    events,
    movie_utils,
    permissions,
    thumbnail as thumbnail_utils
)


ALLOWED_PICTURE_EXTENSION = [".png", ".jpg", ".PNG", ".JPG"]
ALLOWED_MOVIE_EXTENSION = [".mp4", ".mov", ".MP4", ".MOV"]
ALLOWED_FILE_EXTENSION = [".obj", ".pdf", ".ma", ".mb"]


class CreatePreviewFilePictureResource(Resource):

    @jwt_required
    def post(self, instance_id):
        if not self.is_exist(instance_id):
            abort(404)

        if not self.is_allowed(instance_id):
            abort(403)

        uploaded_file = request.files["file"]

        extension = "." + uploaded_file.filename.split(".")[-1].lower()

        if extension in ALLOWED_PICTURE_EXTENSION:
            self.save_picture_preview(instance_id, uploaded_file)
            preview_file = files_service.update_preview_file(
                instance_id,
                {"extension": "png"}
            )
            self.emit_app_preview_event(instance_id)
            return preview_file, 201

        elif extension in ALLOWED_MOVIE_EXTENSION:
            self.save_movie_preview(instance_id, uploaded_file)
            preview_file = files_service.update_preview_file(
                instance_id,
                {"extension": "mp4"}
            )
            self.emit_app_preview_event(instance_id)
            return preview_file, 201

        elif extension in ALLOWED_FILE_EXTENSION:
            self.save_file_preview(instance_id, uploaded_file, extension)
            preview_file = files_service.update_preview_file(
                instance_id,
                {"extension": extension[1:]}
            )
            self.emit_app_preview_event(instance_id)
            return preview_file, 201

        else:
            current_app.logger.info(
                "Wrong file format, extension: %s", extension)
            abort(400, "Wrong file format, extension: %s" % extension)

    def save_picture_preview(self, instance_id, uploaded_file):
        tmp_folder = current_app.config["TMP_DIR"]
        original_tmp_path = thumbnail_utils.save_file(
            tmp_folder,
            instance_id,
            uploaded_file
        )
        return self.save_variants(original_tmp_path, instance_id)

    def save_movie_preview(self, instance_id, uploaded_file):
        tmp_folder = current_app.config["TMP_DIR"]
        uploaded_movie_path = movie_utils.save_file(
            tmp_folder,
            instance_id,
            uploaded_file
        )
        normalized_movie_path = movie_utils.normalize_movie(uploaded_movie_path)
        file_store.add_movie("previews", instance_id, normalized_movie_path)
        original_tmp_path = movie_utils.generate_thumbnail(
            normalized_movie_path
        )

        os.remove(uploaded_movie_path)
        os.remove(normalized_movie_path)
        return self.save_variants(original_tmp_path, instance_id)

    def save_file_preview(self, instance_id, uploaded_file, extension):
        tmp_folder = current_app.config["TMP_DIR"]
        file_name = instance_id + extension
        file_path = os.path.join(tmp_folder, file_name)
        uploaded_file.save(file_path)
        file_store.add_file("previews", instance_id, file_path)
        os.remove(file_path)
        return file_path

    def save_variants(self, original_tmp_path, instance_id):
        variants = thumbnail_utils.generate_preview_variants(
            original_tmp_path,
            instance_id
        )
        variants.append(("original", original_tmp_path))
        for (name, path) in variants:
            file_store.add_picture(name, instance_id, path)
            os.remove(path)

        return variants

    def emit_app_preview_event(self, preview_file_id):
        preview_file = files_service.get_preview_file(preview_file_id)
        comment = tasks_service.get_comment_by_preview_file_id(
            preview_file_id
        )
        comment_id = None
        if comment is not None:
            comment_id = comment["id"]

        events.emit("preview:add", {
            "comment_id": comment_id,
            "task_id": preview_file["task_id"],
            "preview_file_id": preview_file["id"],
            "is_movie": preview_file["is_movie"],
            "revision": preview_file["revision"],
            "extension": preview_file["extension"]
        })

    def is_allowed(self, preview_file_id):
        if permissions.has_manager_permissions():
            return True
        else:
            preview_file = files_service.get_preview_file(preview_file_id)
            return user_service.check_assigned(preview_file["task_id"])

    def is_exist(self, preview_file_id):
        return files_service.get_preview_file(preview_file_id) is not None


class PreviewFileMovieResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    def is_exist(self, preview_file_id):
        return files_service.get_preview_file(preview_file_id) is not None

    def is_allowed(self, preview_file_id):
        if permissions.has_manager_permissions():
            return True
        else:
            preview_file = files_service.get_preview_file(preview_file_id)
            task = tasks_service.get_task(preview_file["task_id"])
            try:
                user_service.check_has_task_related(task["project_id"])
                return True
            except permissions.PermissionDenied:
                return False

    @jwt_required
    def get(self, instance_id):
        if not self.is_exist(instance_id):
            abort(404)

        if not self.is_allowed(instance_id):
            abort(403)

        return send_file(
            file_store.open_movie("previews", instance_id),
            mimetype="video/mp4"
        )


class PreviewFileResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    def is_exist(self, preview_file_id):
        return files_service.get_preview_file(preview_file_id) is not None

    def is_allowed(self, preview_file_id):
        if permissions.has_manager_permissions():
            return True
        else:
            preview_file = files_service.get_preview_file(preview_file_id)
            task = tasks_service.get_task(preview_file["task_id"])
            try:
                user_service.check_has_task_related(task["project_id"])
                return True
            except permissions.PermissionDenied:
                return False

    @jwt_required
    def get(self, instance_id, extension):
        if not self.is_exist(instance_id):
            abort(404)

        if not self.is_allowed(instance_id):
            abort(403)

        try:
            if extension == "png":
                mimetype = "image/png"
                stream = file_store.open_picture("previews", instance_id)
            elif extension == "pdf":
                mimetype = "application/pdf"
                stream = file_store.open_file("previews", instance_id)
            else:
                mimetype = "application/octet-stream"
                stream = file_store.open_file("previews", instance_id)

            return send_file(stream, mimetype=mimetype)
        except FileNotFound:
            current_app.logger.error("File was not found for: %s" % instance_id)
            abort(404)


class BasePreviewPictureResource(Resource):

    def __init__(self, picture_type):
        Resource.__init__(self)
        self.picture_type = picture_type

    def is_exist(self, preview_file_id):
        return files_service.get_preview_file(preview_file_id) is not None

    def is_allowed(self, preview_file_id):
        if permissions.has_manager_permissions():
            return True
        else:
            preview_file = files_service.get_preview_file(preview_file_id)
            task = tasks_service.get_task(preview_file["task_id"])
            try:
                user_service.check_has_task_related(task["project_id"])
                return True
            except permissions.PermissionDenied:
                return False

    @jwt_required
    def get(self, instance_id):
        if not self.is_exist(instance_id):
            abort(404)

        if not self.is_allowed(instance_id):
            abort(403)

        return send_file(
            file_store.open_picture(
                self.picture_type,
                instance_id
            ),
            mimetype="image/png"
        )


class PreviewFileThumbnailResource(BasePreviewPictureResource):

    def __init__(self):
        BasePreviewPictureResource.__init__(self, "thumbnails")


class PreviewFilePreviewResource(BasePreviewPictureResource):

    def __init__(self):
        BasePreviewPictureResource.__init__(self, "previews")


class PreviewFileThumbnailSquareResource(BasePreviewPictureResource):

    def __init__(self):
        BasePreviewPictureResource.__init__(
            self,
            "thumbnails-square"
        )


class PreviewFileOriginalResource(BasePreviewPictureResource):

    def __init__(self):
        BasePreviewPictureResource.__init__(self, "originals")


class BaseCreatePictureResource(Resource):

    def __init__(self, data_type, size=thumbnail_utils.RECTANGLE_SIZE):
        Resource.__init__(self)
        self.data_type = data_type
        self.size = size

    def check_permissions(self, instance_id):
        permissions.check_admin_permissions()

    def prepare_creation(self, instance_id):
        pass

    @jwt_required
    def post(self, instance_id):
        if not self.is_exist(instance_id):
            abort(404)

        self.check_permissions(instance_id)
        self.prepare_creation(instance_id)
        tmp_folder = current_app.config["TMP_DIR"]
        uploaded_file = request.files["file"]
        thumbnail_path = thumbnail_utils.save_file(
            tmp_folder,
            instance_id,
            uploaded_file
        )
        thumbnail_path = thumbnail_utils.turn_into_thumbnail(
            thumbnail_path,
            size=self.size
        )
        file_store.add_picture("thumbnails", instance_id, thumbnail_path)
        os.remove(thumbnail_path)

        thumbnail_url_path = \
            thumbnail_utils.url_path(
                self.data_type,
                instance_id
            )

        return {"thumbnail_path": thumbnail_url_path}, 201


class BasePictureResource(Resource):

    def __init__(self, subfolder):
        Resource.__init__(self)
        self.subfolder = subfolder

    def is_allowed(self, instance_id):
        return True

    @jwt_required
    def get(self, instance_id):
        if not self.is_exist(instance_id):
            abort(404)

        if not self.is_allowed(instance_id):
            abort(403)

        try:
            return send_file(
                file_store.open_picture(
                    "thumbnails",
                    instance_id
                ),
                mimetype="image/png"
            )

        except FileNotFound:
            current_app.logger.error("File was not found for: %s" % instance_id)
            abort(404)


class CreatePersonThumbnailResource(BaseCreatePictureResource):

    def __init__(self):
        BaseCreatePictureResource.__init__(
            self,
            "persons",
            thumbnail_utils.BIG_SQUARE_SIZE
        )

    def is_exist(self, person_id):
        return persons_service.get_person(person_id) is not None

    def check_permissions(self, instance_id):
        is_current_user = \
            persons_service.get_current_user()["id"] != instance_id
        if is_current_user and not permissions.has_manager_permissions():
            raise permissions.PermissionDenied

    def prepare_creation(self, instance_id):
        return persons_service.update_person(
            instance_id,
            {"has_avatar": True}
        )


class PersonThumbnailResource(BasePictureResource):

    def __init__(self):
        BasePictureResource.__init__(
            self,
            "persons"
        )

    def is_exist(self, person_id):
        return persons_service.get_person(person_id) is not None


class CreateProjectThumbnailResource(BaseCreatePictureResource):

    def __init__(self):
        BaseCreatePictureResource.__init__(
            self,
            "projects",
            thumbnail_utils.SQUARE_SIZE
        )

    def is_exist(self, project_id):
        return projects_service.get_project(project_id) is not None

    def prepare_creation(self, instance_id):
        return projects_service.update_project(
            instance_id,
            {"has_avatar": True}
        )


class ProjectThumbnailResource(BasePictureResource):

    def __init__(self):
        BasePictureResource.__init__(self, "projects")

    def is_exist(self, project_id):
        return projects_service.get_project(project_id) is not None

    def is_allowed(self, project_id):
        try:
            if not permissions.has_manager_permissions():
                user_service.check_has_task_related(project_id)
            return True
        except permissions.PermissionDenied:
            return False


class SetMainPreviewResource(Resource):

    @jwt_required
    def put(self, entity_id, preview_file_id):
        permissions.check_manager_permissions()
        return entities_service.update_entity_preview(
            entity_id,
            preview_file_id
        )
