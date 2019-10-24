import datetime

from flask_restful import current_app

from zou.app.models.task import Task
from zou.app.models.comment import Comment
from zou.app.models.person import Person

from zou.app.blueprints.source.shotgun.base import (
    BaseImportShotgunResource,
    ImportRemoveShotgunBaseResource,
)


class ImportShotgunNotesResource(BaseImportShotgunResource):
    def prepare_import(self):
        self.person_ids = Person.get_id_map()

    def filtered_entries(self):
        return (x for x in self.sg_entries if self.is_note_linked_to_task(x))

    def is_note_linked_to_task(self, sg_note):
        if len(sg_note["tasks"]) == 0:
            return False

        task = Task.get_by(shotgun_id=sg_note["tasks"][0]["id"])
        return task is not None

    def extract_data(self, sg_note):
        task = Task.get_by(shotgun_id=sg_note["tasks"][0]["id"])
        person_id = self.person_ids.get(sg_note["user"]["id"], None)
        date = datetime.datetime.strptime(
            sg_note["created_at"][:19], "%Y-%m-%dT%H:%M:%S"
        )

        return {
            "text": sg_note["content"],
            "shotgun_id": sg_note["id"],
            "object_id": task.id,
            "object_type": "Task",
            "person_id": person_id,
            "created_at": date,
        }

    def import_entry(self, data):
        comment = Comment.get_by(shotgun_id=data["shotgun_id"])
        if comment is None:
            comment = Comment(**data)
            comment.save()
            current_app.logger.info("Comment created: %s" % comment)

        else:
            comment.update(data)
            current_app.logger.info("Comment updated: %s" % comment)
        return comment


class ImportRemoveShotgunNoteResource(ImportRemoveShotgunBaseResource):
    def __init__(self):
        ImportRemoveShotgunBaseResource.__init__(self, Comment)
