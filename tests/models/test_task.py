from tests.base import ApiDBTestCase
from zou.app.models.task import Task
from zou.app.models.person import Person

from zou.app.utils import fields


class TaskTestCase(ApiDBTestCase):

    def setUp(self):
        super(TaskTestCase, self).setUp()
        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_asset_type()
        self.generate_fixture_asset()
        self.generate_fixture_person()
        self.generate_fixture_department()
        self.generate_fixture_task_type()
        self.generate_fixture_task_status()
        self.assigner = Person(first_name='Ema', last_name='Peel')
        self.assigner.save()
        self.tasks = self.generate_data(
            Task,
            3,
            entities_out=[],
            project_id=self.project.id,
            task_type_id=self.task_type.id,
            task_status_id=self.task_status.id,
            entity_id=self.asset.id,
            assignees=[self.person],
            assigner_id=self.assigner.id
        )

    def test_get_tasks(self):
        tasks = self.get("data/tasks")
        self.assertEquals(len(tasks), 3)

    def test_get_task(self):
        task = self.get_first("data/tasks")
        task_again = self.get("data/tasks/%s" % task["id"])
        self.assertEquals(task, task_again)
        self.get_404("data/tasks/%s" % fields.gen_uuid())

    def test_create_task(self):
        data = {
            "name": "Modeling arbre",
            "project_id": self.project.id,
            "task_type_id": self.task_type.id,
            "task_status_id": self.task_status.id,
            "entity_id": self.asset.id,
            "assignees": [str(self.person.id)],
            "assigner_id": self.assigner.id
        }
        self.task = self.post("data/tasks", data)
        self.assertIsNotNone(self.task["id"])
        self.assertEquals(
            str(self.person.id),
            self.task["assignees"][0]
        )
        self.assertEquals(
            str(self.person.id),
            self.task["assignees"][0]
        )

        tasks = self.get("data/tasks")
        self.assertEquals(len(tasks), 4)

        del self.task["assignees"]
        data["name"] = "Task without assignees"
        self.task = self.post("data/tasks", data)
        self.assertEquals(len(tasks), 4)

    def test_update_task(self):
        task = self.get_first("data/tasks")
        data = {
            "name": "Modeling arbre 2"
        }
        self.put("data/tasks/%s" % task["id"], data)
        task_again = self.get("data/tasks/%s" % task["id"])
        self.assertEquals(data["name"], task_again["name"])
        self.put_404("data/tasks/%s" % fields.gen_uuid(), data)

    def test_delete_task(self):
        tasks = self.get("data/tasks")
        self.assertEquals(len(tasks), 3)
        task = tasks[0]
        self.delete("data/tasks/%s" % task["id"])
        tasks = self.get("data/tasks")
        self.assertEquals(len(tasks), 2)
        self.delete_404("data/tasks/%s" % fields.gen_uuid())

    def test_filter_by_assignee(self):
        tasks = self.get("data/tasks?assignees=%s" % self.person.id)
        self.assertEquals(len(tasks), 3)

    def test_full_task(self):
        task = self.get("data/tasks/%s/full" % (self.tasks[0].id))
        self.assertEquals(task["task_type"]["name"], "Shaders")
        self.assertEquals(task["persons"][0]["first_name"], "John")
        self.assertEquals(task["task_status"]["name"], "Open")
        self.assertEquals(task["project"]["name"], "Cosmos Landromat")
        self.assertEquals(task["entity"]["name"], "Tree")
        self.assertEquals(task["assigner"]["first_name"], "Ema")
