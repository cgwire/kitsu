from test.base import ApiDBTestCase

from zou.app.services import tasks_service


class RouteCreateTasksTestCase(ApiDBTestCase):

    def setUp(self):
        super(RouteCreateTasksTestCase, self).setUp()

        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_entity_type()
        self.generate_fixture_entity()
        self.generate_fixture_sequence()
        self.generate_fixture_shot()
        self.generate_fixture_department()
        self.generate_fixture_task_type()
        self.generate_fixture_task_status()
        self.generate_fixture_person()
        self.generate_fixture_assigner()
        self.todo_status = tasks_service.get_or_create_status("Todo")
        self.entity_id = str(self.entity.id)
        self.shot_id = str(self.shot.id)
        self.task_type_id = str(self.task_type.id)

    def test_create_asset_tasks(self):
        path = "/actions/task-types/%s/assets/create-tasks" % self.task_type_id
        tasks = self.post(path, {})
        self.assertEqual(len(tasks), 1)

        tasks = self.get("/data/tasks")
        self.assertEqual(len(tasks), 1)
        task = tasks[0]
        self.assertEqual(task["name"], "main")
        self.assertEqual(task["task_type_id"], self.task_type_id)
        self.assertEqual(task["entity_id"], self.entity_id)

    def test_create_shot_tasks(self):
        path = "/actions/task-types/%s/shots/create-tasks" % self.task_type_id
        tasks = self.post(path, {})
        self.assertEqual(len(tasks), 1)

        tasks = self.get("/data/tasks")
        self.assertEqual(len(tasks), 1)
        task = tasks[0]
        self.assertEqual(task["name"], "main")
        self.assertEqual(task["task_type_id"], self.task_type_id)
        self.assertEqual(task["entity_id"], self.shot_id)
