import os

from flask import abort, request, current_app
from flask import send_file as flask_send_file
from flask_restful import Resource
from flask_jwt_extended import jwt_required
from flask_fs.errors import FileNotFound

from zou.app.stores import file_store
from zou.app import config
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


ALLOWED_PICTURE_EXTENSION = [".png", ".jpg", ".jpeg", ".PNG", ".JPG", ".JPEG"]
ALLOWED_MOVIE_EXTENSION = [".mp4", ".mov", ".wmv", ".MP4", ".MOV", ".WMV"]
ALLOWED_FILE_EXTENSION = [
    ".obj", ".pdf", ".ma", ".mb", ".rar", ".zip", ".blend"
]


def send_standard_file(
    preview_file_id,
    extension,
    mimetype="application/octet-stream"
):
    return send_storage_file(
        file_store.get_local_file_path,
        file_store.open_file,
        "previews",
        preview_file_id,
        extension,
        mimetype=mimetype
    )


def send_movie_file(preview_file_id):
    return send_storage_file(
        file_store.get_local_movie_path,
        file_store.open_movie,
        "previews",
        preview_file_id,
        "mp4",
        mimetype="video/mp4"
    )


def send_picture_file(prefix, preview_file_id):
    return send_storage_file(
        file_store.get_local_picture_path,
        file_store.open_picture,
        prefix,
        preview_file_id,
        "png",
        mimetype="image/png"
    )


def send_storage_file(
    get_path,
    open_file,
    prefix,
    preview_file_id,
    extension,
    mimetype="application/octet-stream"
):
    """
    Send file from storage. If it's not a local storage, cache the file in
    a temporary folder before sending it. It accepts conditional headers.
    """
    if config.FS_BACKEND == "local":
        file_path = get_path(prefix, preview_file_id)
    else:
        file_path = os.path.join(
            config.TMP_DIR,
            "cache-%s-%s.%s" % (prefix, preview_file_id, extension)
        )
        if not os.path.exists(file_path):
            with open(file_path, 'wb') as tmp_file:
                for chunk in open_file(prefix, preview_file_id):
                    tmp_file.write(chunk)

    try:
        return flask_send_file(
            file_path,
            conditional=True,
            mimetype=mimetype
        )
    except IOError:
        return {
            "error": True,
            "message": "File not found for: %s %s" % (
                prefix,
                preview_file_id
            )
        }, 404
    except FileNotFound:
        return {
            "error": True,
            "message": "File not found for: %s %s" % (
                prefix,
                preview_file_id
            )
        }, 404


class CreatePreviewFilePictureResource(Resource):
    """
    Main resource to add a preview. It stores the preview file and generates
    three picture files matching preview when it's possible: a square thumbnail,
    a rectangle thumbnail and a midsize file.
    """

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
        """
        Get uploaded picture, build thumbnails then save everything in the file
        storage.
        """
        tmp_folder = current_app.config["TMP_DIR"]
        original_tmp_path = thumbnail_utils.save_file(
            tmp_folder,
            instance_id,
            uploaded_file
        )
        return self.save_variants(original_tmp_path, instance_id)

    def save_movie_preview(self, instance_id, uploaded_file):
        """
        Get uploaded movie, normalize it (720p) then build thumbnails then save
        everything in the file storage.
        """
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
        """
        Get uploaded file then save it in the file storage.
        """
        tmp_folder = current_app.config["TMP_DIR"]
        file_name = instance_id + extension
        file_path = os.path.join(tmp_folder, file_name)
        uploaded_file.save(file_path)
        file_store.add_file("previews", instance_id, file_path)
        os.remove(file_path)
        return file_path

    def save_variants(self, original_tmp_path, instance_id):
        """
        Build variants of a picture file and save them in the main storage.
        """
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
        """
        Emit an event, each time a preview is added.
        """
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
        """
        Return true if user is allowed to add a preview.
        """
        preview_file = files_service.get_preview_file(preview_file_id)
        task = tasks_service.get_task(preview_file["task_id"])
        try:
            user_service.check_project_access(task["project_id"])
            return True
        except permissions.PermissionDenied:
            return False

    def is_exist(self, preview_file_id):
        """
        Return true if preview file entry matching given id exists in database.
        """
        return files_service.get_preview_file(preview_file_id) is not None


class PreviewFileMovieResource(Resource):
    """
    Allow to download a movie preview.
    """

    def __init__(self):
        Resource.__init__(self)

    def is_exist(self, preview_file_id):
        return files_service.get_preview_file(preview_file_id) is not None

    def is_allowed(self, preview_file_id):
        preview_file = files_service.get_preview_file(preview_file_id)
        task = tasks_service.get_task(preview_file["task_id"])
        try:
            user_service.check_project_access(task["project_id"])
            return True
        except permissions.PermissionDenied:
            return False

    @jwt_required
    def get(self, instance_id):
        if not self.is_exist(instance_id):
            abort(404)

        if not self.is_allowed(instance_id):
            abort(403)

        try:
            return send_movie_file(instance_id)
        except FileNotFound:
            current_app.logger.error("File was not found for: %s" % instance_id)
            abort(404)


class PreviewFileResource(Resource):
    """
    Allow to download a generic file preview.
    """

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
                user_service.check_project_access(task["project_id"])
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
                return send_picture_file(instance_id)
            elif extension == "pdf":
                mimetype = "application/pdf"
                return send_standard_file(instance_id, extension, mimetype)
            else:
                return send_standard_file(instance_id, extension)

        except FileNotFound:
            current_app.logger.error("File was not found for: %s" % instance_id)
            abort(404)


class BasePreviewPictureResource(Resource):
    """
    Base class to download a thumbnail.
    """

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
                user_service.check_project_access(task["project_id"])
                return True
            except permissions.PermissionDenied:
                return False

    @jwt_required
    def get(self, instance_id):
        if not self.is_exist(instance_id):
            abort(404)

        if not self.is_allowed(instance_id):
            abort(403)

        try:
            return send_picture_file(self.picture_type, instance_id)
        except FileNotFound:
            current_app.logger.error("File was not found for: %s" % instance_id)
            abort(404)


class PreviewFileThumbnailResource(BasePreviewPictureResource):

    def __init__(self):
        BasePreviewPictureResource.__init__(self, "thumbnails")


class PreviewFilePreviewResource(BasePreviewPictureResource):
    """
    Smaller version of uploaded image.
    """

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
        BasePreviewPictureResource.__init__(self, "original")


class BaseCreatePictureResource(Resource):
    """
    Base class to create a thumbnail.
    """

    def __init__(self, data_type, size=thumbnail_utils.RECTANGLE_SIZE):
        Resource.__init__(self)
        self.data_type = data_type
        self.size = size

    def check_permissions(self, instance_id):
        permissions.check_admin_permissions()

    def prepare_creation(self, instance_id):
        pass

    def clear_cache_file(self, preview_file_id):
        if config.FS_BACKEND != "local":
            file_path = os.path.join(
                config.TMP_DIR,
                "cache-%s-%s.%s" % ("thumbnails", preview_file_id, "png")
            )
            if os.path.exists(file_path):
                os.remove(file_path)
        return preview_file_id

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
        self.clear_cache_file(instance_id)

        thumbnail_url_path = \
            thumbnail_utils.url_path(
                self.data_type,
                instance_id
            )

        return {"thumbnail_path": thumbnail_url_path}, 201


class BasePictureResource(Resource):
    """
    Base resource to download a thumbnail.
    """

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
            return send_picture_file("thumbnails", instance_id)
        except FileNotFound:
            current_app.logger.error("File was not found for: %s" % instance_id)
            abort(404)
        except IOError:
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
            user_service.check_project_access(project_id)
            return True
        except permissions.PermissionDenied:
            return False


class SetMainPreviewResource(Resource):

    @jwt_required
    def put(self, entity_id, preview_file_id):
        preview_file = files_service.get_preview_file(preview_file_id)
        task = tasks_service.get_task(preview_file["task_id"])
        user_service.check_project_access(task["project_id"])
        return entities_service.update_entity_preview(
            entity_id,
            preview_file_id
        )
