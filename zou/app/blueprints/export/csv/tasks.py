from zou.app.blueprints.export.csv.base import BaseCsvExport

from zou.app.models.task_status import TaskStatus
from zou.app.models.task_type import TaskType
from zou.app.models.task import Task
from zou.app.models.person import Person
from zou.app.models.project import Project
from zou.app.models.department import Department
from zou.app.models.entity import Entity
from zou.app.models.entity_type import EntityType


class TasksCsvExport(BaseCsvExport):

    def __init__(self):
        BaseCsvExport.__init__(self, Task)

        self.file_name = "tasks_export"

    def build_headers(self):
        return [
            "Project",
            "Department",
            "Task Type",
            "Entity Type",
            "Entity",
            "Assigner",
            "Assignees",
            "Duration",
            "Estimation",
            "Start date",
            "Real start date",
            "Due date",
            "Task Status"
        ]

    def build_query(self):
        query = self.model.query.order_by(
            Project.name,
            TaskType.name,
            Task.name,
        )
        query = query.join(Project)
        query = query.join(TaskType)
        query = query.join(Department)
        query = query.join(TaskStatus)
        query = query.join(Entity, Task.entity_id == Entity.id)
        query = query.join(EntityType)
        query = query.join(Person)
        query = query.add_columns(Project.name)
        query = query.add_columns(Department.name)
        query = query.add_columns(TaskType.name)
        query = query.add_columns(TaskStatus.name)
        query = query.add_columns(EntityType.name)
        query = query.add_columns(Entity.name)
        query = query.add_columns(Person.first_name)
        query = query.add_columns(Person.last_name)
        query = query.order_by(
            Project.name,
            Department.name,
            TaskType.name,
            EntityType.name,
            Entity.name
        )

        return query

    def build_row(self, task_data):
        (
            task,
            project_name,
            department_name,
            task_type_name,
            task_status_name,
            entity_type_name,
            entity_name,
            assigner_first_name,
            assigner_last_name,
        ) = task_data
        persons = task.assignees_as_string()

        start_date = ""
        if task.start_date is not None:
            start_date = task.start_date.strftime("%Y-%m-%d")

        due_date = ""
        if task.due_date is not None:
            due_date = task.due_date.strftime("%Y-%m-%d")

        real_start_date = ""
        if task.real_start_date is not None:
            real_start_date = task.real_start_date.strftime("%Y-%m-%d")

        return [
            project_name,
            department_name,
            task_type_name,
            entity_type_name,
            entity_name,
            assigner_first_name + " " + assigner_last_name,
            persons,
            task.duration,
            task.estimation,
            start_date,
            real_start_date,
            due_date,
            task_status_name,
        ]
