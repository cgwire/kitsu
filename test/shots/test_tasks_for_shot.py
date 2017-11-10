from test.base import ApiDBTestCase


class ShotTasksTestCase(ApiDBTestCase):

    def setUp(self):
        super(ShotTasksTestCase, self).setUp()
        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_entity_type()
        self.generate_fixture_episode()
        self.generate_fixture_sequence()
        self.generate_fixture_shot()
        self.generate_fixture_entity()
        self.generate_fixture_person()
        self.generate_fixture_assigner()
        self.generate_fixture_task_status()
        self.generate_fixture_department()
        self.generate_fixture_task_type()
        self.generate_fixture_shot_task()

    def test_get_tasks_for_shot(self):
        tasks = self.get("data/shots/%s/tasks" % self.shot.id)
        self.assertEquals(len(tasks), 1)
        self.assertEqual(tasks[0]["id"], str(self.shot_task.id))

    def test_get_shots_and_tasks(self):
        self.generate_fixture_shot_task(name="Secondary")
        shots = self.get("data/shots/with-tasks")
        self.assertEqual(len(shots), 1)
        self.assertEqual(len(shots[0]["tasks"]), 2)
        self.assertEqual(
            shots[0]["tasks"][0]["task_status_name"], "Open"
        )
        self.assertEqual(
            shots[0]["tasks"][0]["task_type_name"], "Animation"
        )
        self.assertEqual(shots[0]["episode_name"], "E01")
