from tests.base import ApiDBTestCase
from zou.app.models.task_type import TaskType

from zou.app.utils import fields


class TaskTypeTestCase(ApiDBTestCase):

    def setUp(self):
        super(TaskTypeTestCase, self).setUp()
        self.generate_fixture_department()
        self.department_id = self.department.id
        self.generate_data(TaskType, 3, department_id=self.department_id)

    def test_get_task_types(self):
        task_types = self.get("data/task-types")
        self.assertEquals(len(task_types), 3)

    def test_get_task_type(self):
        task_type = self.get_first("data/task-types")
        task_type_again = self.get(
            "data/task-types/%s" % task_type["id"])
        self.assertEquals(task_type, task_type_again)
        self.get_404("data/task-types/%s" % fields.gen_uuid())

    def test_create_task_type(self):
        data = {
            "name": "animation",
            "color": "#000000",
            "department_id": self.department_id
        }
        self.task_type = self.post("data/task-types", data)
        self.assertIsNotNone(self.task_type["id"])
        self.task_type = self.post("data/task-types", data, 400)

        task_types = self.get("data/task-types")
        self.assertEquals(len(task_types), 4)

    def test_update_task_type(self):
        task_type = self.get_first("data/task-types")
        data = {
            "color": "#FFFFFF"
        }
        self.put("data/task-types/%s" % task_type["id"], data)
        task_type_again = self.get(
            "data/task-types/%s" % task_type["id"])
        self.assertEquals(data["color"], task_type_again["color"])
        self.put_404("data/task-types/%s" % fields.gen_uuid(), data)

    def test_delete_task_type(self):
        task_types = self.get("data/task-types")
        self.assertEquals(len(task_types), 3)
        task_type = task_types[0]
        self.delete("data/task-types/%s" % task_type["id"])
        task_types = self.get("data/task-types")
        self.assertEquals(len(task_types), 2)
        self.delete_404("data/task-types/%s" % fields.gen_uuid())
