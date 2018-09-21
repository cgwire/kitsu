from flask_restful import current_app

from zou.app.models.task_type import TaskType
from zou.app.models.task_status import TaskStatus
from zou.app.models.project import Project
from zou.app.models.person import Person
from zou.app.models.task import Task

from zou.app.services import deletion_service

from zou.app.blueprints.source.shotgun.base import (
    BaseImportShotgunResource,
    ImportRemoveShotgunBaseResource
)


class ImportShotgunTasksResource(BaseImportShotgunResource):

    def prepare_import(self):
        self.project_ids = Project.get_id_map()
        self.person_ids = Person.get_id_map()
        self.task_type_ids = TaskType.get_id_map(field="name")
        self.task_status_ids = TaskStatus.get_id_map(field="short_name")

    def filtered_entries(self):
        return [x for x in self.sg_entries if self.is_valid_task(x)]

    def is_valid_task(self, sg_task):
        return sg_task["step"] is not None and sg_task["project"] is not None

    def extract_data(self, sg_task):
        entity_id = self.get_entity_id(sg_task["entity"])
        task_status_id = self.task_status_ids.get(
            sg_task["sg_status_list"], None
        )
        step_name = sg_task["step"]["name"]
        assigner_id = self.person_ids.get(sg_task["created_by"]["id"], None)
        project_id = self.project_ids.get(sg_task["project"]["id"], None)
        task_type_id = self.task_type_ids.get(step_name, None)
        assignees = self.extract_assignees(sg_task, self.person_ids)

        return {
            "name": sg_task["cached_display_name"],
            "shotgun_id": sg_task["id"],
            "start_date": sg_task["start_date"],
            "due_date": sg_task["due_date"],
            "sort_order": sg_task["sg_sort_order"],
            "duration": sg_task["duration"],
            "task_type_id": task_type_id,
            "task_status_id": task_status_id,
            "project_id": project_id,
            "entity_id": entity_id,
            "assigner_id": assigner_id,
            "assignees": assignees
        }

    def get_entity_id(self, sg_entity):
        entity_id = None
        if sg_entity is not None:
            entity_sg_id = sg_entity["id"]
            entity_type = sg_entity["type"]
            if entity_type == "Asset":
                entity_id = self.get_asset_id(entity_sg_id)
            elif entity_type == "Shot":
                entity_id = self.get_shot_id(entity_sg_id)
            elif entity_type == "Scene":
                entity_id = self.get_scene_id(entity_sg_id)
            else:
                entity_id = self.get_sequence_id(entity_sg_id)

        return entity_id

    def extract_assignees(self, sg_task, person_ids):
        assignees = []
        if len(sg_task["task_assignees"]) > 0:
            for sg_person in sg_task["task_assignees"]:
                person_id = person_ids[sg_person["id"]]
                person = Person.get(person_id)
                assignees.append(person)
        return assignees

    def import_entry(self, data):
        task = Task.get_by(shotgun_id=data["shotgun_id"])

        if task is None:
            task = Task.get_by(
                name=data["name"],
                project_id=data["project_id"],
                task_type_id=data["task_type_id"],
                entity_id=data["entity_id"]
            )

        if task is None:
            task = Task(**data)
            task.save()
            current_app.logger.info("Task created: %s" % task)
        else:
            existing_task = Task.get_by(
                name=data["name"],
                project_id=data["project_id"],
                task_type_id=data["task_type_id"],
                entity_id=data["entity_id"]
            )

            if existing_task is not None:
                data.pop("name", None)
                data.pop("project_id", None)
                data.pop("task_type_id", None)
                data.pop("entity_id", None)

            task.update(data)
            current_app.logger.info("Task updated: %s" % task)

        return task


class ImportRemoveShotgunTaskResource(ImportRemoveShotgunBaseResource):

    def __init__(self):
        ImportRemoveShotgunBaseResource.__init__(
            self,
            Task,
            self.delete_func
        )

    def delete_func(self, entity):
        deletion_service.remove_task(entity.id)
