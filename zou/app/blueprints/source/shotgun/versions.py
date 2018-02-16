from flask_restful import current_app

from zou.app.models.preview_file import PreviewFile
from zou.app.models.person import Person


from zou.app.blueprints.source.shotgun.base import (
    BaseImportShotgunResource,
    ImportRemoveShotgunBaseResource
)


class ImportShotgunVersionsResource(BaseImportShotgunResource):

    def __init__(self):
        BaseImportShotgunResource.__init__(self)

    def prepare_import(self):
        self.person_ids = Person.get_id_map()

    def filtered_entries(self):
        return (x for x in self.sg_entries if self.is_version_linked_to_task(x))

    def is_version_linked_to_task(self, version):
        return version["sg_task"] is not None

    def extract_data(self, sg_version):
        data = {
            "name": sg_version["code"],
            "shotgun_id": sg_version["id"],
            "description": sg_version["description"],
            "source": "Shotgun"
        }

        if "user" in sg_version and sg_version["user"] is not None:
            data["person_id"] = self.person_ids.get(
                sg_version["user"]["id"],
                None
            )

        if sg_version["sg_task"] is not None:
            data["task_id"] = self.get_task_id(sg_version["sg_task"]["id"])

        if sg_version["sg_uploaded_movie"] is not None:
            data["uploaded_movie_url"] = \
                sg_version["sg_uploaded_movie"]["url"]
            data["uploaded_movie_name"] = \
                sg_version["sg_uploaded_movie"]["name"]

        return data

    def import_entry(self, data):
        preview_file = PreviewFile.get_by(shotgun_id=data["shotgun_id"])
        if preview_file is None:
            preview_file = PreviewFile.get_by(
                name=data["name"],
                task_id=data["task_id"]
            )

        if preview_file is None:
            preview_file = PreviewFile(**data)
            preview_file.save()
            current_app.logger.info("PreviewFile created: %s" % preview_file)
        else:
            preview_file.update(data)
            current_app.logger.info("PreviewFile updated: %s" % preview_file)
        return preview_file


class ImportRemoveShotgunVersionResource(ImportRemoveShotgunBaseResource):

    def __init__(self):
        ImportRemoveShotgunBaseResource.__init__(self, PreviewFile)
