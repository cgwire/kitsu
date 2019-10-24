from zou.app.blueprints.export.csv.base import BaseCsvExport

from zou.app.models.department import Department
from zou.app.models.task_type import TaskType


class TaskTypesCsvExport(BaseCsvExport):
    def __init__(self):
        BaseCsvExport.__init__(self, TaskType)

        self.name = "task_types_export"

    def build_headers(self):
        return ["Department", "Name"]

    def build_query(self):
        query = self.model.query.order_by(Department.name, TaskType.name)
        query = query.join(Department)
        query = query.add_columns(Department.name)
        return query

    def build_row(self, task_type_row):
        (task_type, department_name) = task_type_row
        return [department_name, task_type.name]
