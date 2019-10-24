from flask_restful import Resource, current_app

from zou.app.models.department import Department
from zou.app.models.task_type import TaskType
from zou.app.utils import colors
from zou.app.services import tasks_service

from zou.app.blueprints.source.shotgun.base import (
    BaseImportShotgunResource,
    ImportRemoveShotgunBaseResource,
)


class ImportShotgunStepsResource(BaseImportShotgunResource):
    def __init__(self):
        Resource.__init__(self)

    def extract_data(self, sg_step):
        color = self.extract_color(sg_step)
        department_name = self.extract_department_name(sg_step)
        return {
            "name": sg_step["code"],
            "short_name": sg_step.get("short_name", ""),
            "shotgun_id": sg_step["id"],
            "color": color,
            "department_name": department_name,
            "for_entity": sg_step.get("entity_type", "Asset"),
        }

    def extract_color(self, sg_step):
        color = sg_step.get("color", "0,0,0")
        return colors.rgb_to_hex(color)

    def extract_department_name(self, sg_step):
        splitted_name = sg_step["code"].split(" ")
        department_name = splitted_name[0]
        return department_name

    def import_entry(self, data):
        department = self.save_department(data)
        return self.save_task_type(department, data)

    def save_department(self, data):
        department = Department.get_by(name=data["department_name"])
        if department is None:
            department_data = {
                "name": data["department_name"],
                "color": data["color"],
            }
            department = Department(**department_data)
            department.save()
            current_app.logger.info("Department created: %s" % department)
        del data["department_name"]
        return department

    def save_task_type(self, department, data):
        task_type = TaskType.get_by(shotgun_id=data["shotgun_id"])
        data["department_id"] = department.id
        if task_type is None:
            task_type = TaskType.get_by(
                name=data["name"], for_entity=data["for_entity"]
            )

        if task_type is None:
            task_type = TaskType(**data)
            task_type.save()
            current_app.logger.info("Task Type created: %s" % task_type)
        else:
            existing_task_type = TaskType.get_by(
                name=data["name"],
                for_entity=data["for_entity"],
                department_id=data["department_id"],
            )
            if existing_task_type is not None:
                data.pop("name", None)
                data.pop("for_entity", None)
                data.pop("department_id", None)
            task_type.update(data)
            tasks_service.clear_task_type_cache(str(task_type.id))
            current_app.logger.info("Task Type updated: %s" % task_type)
        return task_type


class ImportRemoveShotgunStepResource(ImportRemoveShotgunBaseResource):
    def __init__(self):
        ImportRemoveShotgunBaseResource.__init__(self, TaskType)
