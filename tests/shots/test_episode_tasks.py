from tests.base import ApiDBTestCase


class EpisodeTasksTestCase(ApiDBTestCase):

    def setUp(self):
        super(EpisodeTasksTestCase, self).setUp()
        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_asset_type()
        self.generate_fixture_episode()
        self.generate_fixture_asset()
        self.generate_fixture_person()
        self.generate_fixture_assigner()
        self.generate_fixture_task_status()
        self.generate_fixture_department()
        self.generate_fixture_task_type()
        self.generate_fixture_episode_task()
        self.person_id = str(self.person.id)

    def test_get_tasks_for_episode(self):
        tasks = self.get("data/episodes/%s/tasks" % self.episode.id)
        self.assertEquals(len(tasks), 1)
        self.assertEqual(tasks[0]["id"], str(self.episode_task.id))

    def test_get_episodes_and_tasks(self):
        self.generate_fixture_episode_task(name="Secondary")
        episodes = self.get("data/episodes/with-tasks")
        self.assertEqual(len(episodes), 1)
        self.assertEqual(len(episodes[0]["tasks"]), 2)
        self.assertEqual(episodes[0]["tasks"][0]["assignees"][0], self.person_id)
        self.assertEqual(episodes[0]["name"], "E01")

    def test_get_task_types_for_episode(self):
        task_types = self.get("/data/episodes/%s/task-types" % self.episode.id)
        self.assertEquals(len(task_types), 1)
        self.assertDictEqual(
            task_types[0],
            self.task_type_animation.serialize()
        )
