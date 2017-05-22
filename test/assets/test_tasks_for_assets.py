from test.base import ApiDBTestCase


class AssetTasksTestCase(ApiDBTestCase):

    def setUp(self):
        super(AssetTasksTestCase, self).setUp()
        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_entity_type()
        self.generate_fixture_sequence()
        self.generate_fixture_shot()
        self.generate_fixture_entity()
        self.generate_fixture_person()
        self.generate_fixture_assigner()
        self.generate_fixture_task_status()
        self.generate_fixture_department()
        self.generate_fixture_task_type()
        self.generate_fixture_shot_task()
        self.generate_fixture_task()

    def test_get_tasks_for_asset(self):
        tasks = self.get("data/assets/%s/tasks" % self.entity.id)
        self.assertEquals(len(tasks), 1)
        self.assertEqual(tasks[0]["id"], str(self.task.id))
