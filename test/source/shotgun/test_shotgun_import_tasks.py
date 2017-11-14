from test.source.shotgun.base import ShotgunTestCase

from zou.app.models.project import Project
from zou.app.models.person import Person
from zou.app.models.task_type import TaskType
from zou.app.models.task_status import TaskStatus

from zou.app.services import assets_service, shots_service


class ImportShotgunTaskTestCase(ShotgunTestCase):

    def setUp(self):
        super(ImportShotgunTaskTestCase, self).setUp()
        self.load_fixture('persons')
        self.load_fixture('projects')
        self.load_fixture('status')
        self.load_fixture('steps')
        self.load_fixture('assets')
        self.load_fixture('shots')
        self.load_fixture('sequences')

    def load_task(self):
        self.sg_task = {
            "cached_display_name": "Shading",
            "created_by": {
                "id": 1,
                "name": "John Doe",
                "type": "HumanUser"
            },
            "due_date": None,
            "duration": 7200,
            "entity": {
                "id": 1,
                "name": "Sheep",
                "type": "Asset"
            },
            "id": 20,
            "project": {
                "id": 1,
                "name": "Agent327",
                "type": "Project"
            },
            "sg_description": "test description",
            "sg_sort_order": None,
            "sg_status_list": "wip",
            "start_date": None,
            "step": {
                "id": 1,
                "name": "Modeling Shading",
                "type": "Step"
            },
            "task_assignees": [{
                "id": 2,
                "name": "Ema Peel",
                "type": "HumanUser"
            }],
            "type": "Task"
        }

        api_path = "/import/shotgun/tasks"
        self.tasks = self.post(api_path, [self.sg_task], 200)

    def load_sequence_task(self):
        self.sg_task = {
            "cached_display_name": "Previz",
            "created_by": {
                "id": 1,
                "name": "John Doe",
                "type": "HumanUser"
            },
            "due_date": None,
            "duration": 7200,
            "entity": {
                "id": 1,
                "name": "S01",
                "type": "Sequence"
            },
            "id": 20,
            "project": {
                "id": 1,
                "name": "Agent327",
                "type": "Project"
            },
            "sg_description": "test description",
            "sg_sort_order": None,
            "sg_status_list": "wip",
            "start_date": None,
            "step": {
                "id": 1,
                "name": "Modeling Shading",
                "type": "Step"
            },
            "task_assignees": [{
                "id": 2,
                "name": "Ema Peel",
                "type": "HumanUser"
            }],
            "type": "Task"
        }

        api_path = "/import/shotgun/tasks"
        self.tasks = self.post(api_path, [self.sg_task], 200)

    def test_import_tasks(self):
        self.tasks = self.load_fixture('tasks')
        self.assertEqual(len(self.tasks), 2)

        self.tasks = self.get("data/tasks")
        self.assertEqual(len(self.tasks), 2)

    def test_import_tasks_twice(self):
        self.tasks = self.load_fixture('tasks')
        self.tasks = self.load_fixture('tasks')
        self.tasks = self.get("data/tasks")
        self.assertEqual(len(self.tasks), 2)

    def test_import_task(self):
        self.load_task()
        self.assertEqual(len(self.tasks), 1)

        self.tasks = self.get("data/tasks")
        self.assertEqual(len(self.tasks), 1)

        task = self.tasks[0]
        project = Project.get_by(name=self.sg_task["project"]["name"])
        task_type = \
            TaskType.get_by(name=self.sg_task["step"]["name"])
        task_status = TaskStatus.get_by(
            short_name=self.sg_task["sg_status_list"])
        assets = assets_service.get_assets(
            {"shotgun_id": self.sg_task["entity"]["id"]})
        entity = assets[0]
        assigner = Person.get_by(
            last_name=self.sg_task["created_by"]["name"].split(" ")[1])
        assignee = Person.get_by(
            last_name=self.sg_task["task_assignees"][0]["name"].split(" ")[1])

        self.assertEqual(task["name"], self.sg_task["cached_display_name"])
        self.assertEqual(task["duration"], self.sg_task["duration"])
        self.assertEqual(task["shotgun_id"], self.sg_task["id"])
        self.assertEqual(task["project_id"], str(project.id))
        self.assertEqual(task["task_type_id"], str(task_type.id))
        self.assertEqual(task["task_status_id"], str(task_status.id))
        self.assertEqual(task["entity_id"], entity["id"])
        self.assertEqual(task["assigner_id"], str(assigner.id))
        self.assertEqual(task["assignees"][0], str(assignee.id))

    def test_import_sequence_task(self):
        self.load_sequence_task()
        sequences = shots_service.get_sequences({"shotgun_id": 1})
        self.tasks = self.get("data/tasks?entity_id=%s" % sequences[0]["id"])
        self.assertEqual(len(self.tasks), 1)

    def test_import_remove_task(self):
        self.load_task()
        api_path = "/import/shotgun/remove/task"
        sg_task = {"id": self.sg_task["id"]}
        self.tasks = self.get("data/tasks?shotgun_id=%s" % self.sg_task["id"])
        task = self.tasks[0]

        response = self.post(api_path, sg_task, 200)
        self.assertEqual(response["removed_instance_id"], task["id"])
        self.tasks = self.get("data/tasks?shotgun_id=%s" % self.sg_task["id"])
        self.assertEqual(len(self.tasks), 0)
