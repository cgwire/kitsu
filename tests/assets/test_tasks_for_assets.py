from tests.base import ApiDBTestCase


class AssetTasksTestCase(ApiDBTestCase):

    def setUp(self):
        super(AssetTasksTestCase, self).setUp()
        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_asset_type()
        self.generate_fixture_sequence()
        self.generate_fixture_shot()
        self.generate_fixture_asset()
        self.generate_fixture_person()
        self.generate_fixture_assigner()
        self.generate_fixture_task_status()
        self.generate_fixture_department()
        self.generate_fixture_task_type()
        self.generate_fixture_shot_task()
        self.generate_fixture_task()
        self.person_id = str(self.person.id)

    def test_get_tasks_for_asset(self):
        tasks = self.get("data/assets/%s/tasks" % self.asset.id)
        self.assertEquals(len(tasks), 1)
        self.assertEqual(tasks[0]["id"], str(self.task.id))

    def test_get_assets_and_tasks(self):
        self.generate_fixture_task(name="Secondary")
        assets = self.get("data/assets/with-tasks")
        self.assertEqual(len(assets), 1)
        self.assertEqual(len(assets[0]["tasks"]), 2)
        self.assertEqual(
            assets[0]["tasks"][0]["assignees"][0], str(self.person_id)
        )
