from test.base import ApiDBTestCase
from zou.app.models.task_status import TaskStatus

from zou.app.utils import fields


class TaskStatusTestCase(ApiDBTestCase):

    def setUp(self):
        super(TaskStatusTestCase, self).setUp()
        self.generate_data(TaskStatus, 3)

    def test_get_task_statuss(self):
        task_statuss = self.get("data/task-status")
        self.assertEquals(len(task_statuss), 3)

    def test_get_task_status(self):
        task_status = self.get_first("data/task-status")
        task_status_again = self.get(
            "data/task-status/%s" % task_status["id"])
        self.assertEquals(task_status, task_status_again)
        self.get_404("data/task-status/%s" % fields.gen_uuid())

    def test_create_task_status(self):
        data = {
            "name": "open",
            "short_name": "open",
            "color": "#000000"
        }
        self.task_status = self.post("data/task-status", data)
        self.assertIsNotNone(self.task_status["id"])

        task_statuss = self.get("data/task-status")
        self.assertEquals(len(task_statuss), 4)

    def test_update_task_status(self):
        task_status = self.get_first("data/task-status")
        data = {
            "color": "#FFFFFF"
        }
        self.put("data/task-status/%s" % task_status["id"], data)
        task_status_again = self.get(
            "data/task-status/%s" % task_status["id"])
        self.assertEquals(data["color"], task_status_again["color"])
        self.put_404("data/task-status/%s" % fields.gen_uuid(), data)

    def test_delete_task_status(self):
        task_statuss = self.get("data/task-status")
        self.assertEquals(len(task_statuss), 3)
        task_status = task_statuss[0]
        self.delete("data/task-status/%s" % task_status["id"])
        task_statuss = self.get("data/task-status")
        self.assertEquals(len(task_statuss), 2)
        self.delete_404("data/task-status/%s" % fields.gen_uuid())
