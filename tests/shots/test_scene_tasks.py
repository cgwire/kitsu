from tests.base import ApiDBTestCase


class SceneTasksTestCase(ApiDBTestCase):

    def setUp(self):
        super(SceneTasksTestCase, self).setUp()
        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_asset_type()
        self.generate_fixture_episode()
        self.generate_fixture_sequence()
        self.generate_fixture_scene()
        self.generate_fixture_asset()
        self.generate_fixture_person()
        self.generate_fixture_assigner()
        self.generate_fixture_task_status()
        self.generate_fixture_department()
        self.generate_fixture_task_type()
        self.generate_fixture_scene_task()
        self.person_id = str(self.person.id)

    def test_get_tasks_for_scene(self):
        tasks = self.get("data/scenes/%s/tasks" % self.scene.id)
        self.assertEquals(len(tasks), 1)
        self.assertEqual(tasks[0]["id"], str(self.scene_task.id))

    def test_get_scenes_and_tasks(self):
        self.generate_fixture_scene_task(name="Secondary")
        scenes = self.get("data/scenes/with-tasks")
        self.assertEqual(len(scenes), 1)
        self.assertEqual(len(scenes[0]["tasks"]), 2)
        self.assertEqual(scenes[0]["tasks"][0]["assignees"][0], self.person_id)
        self.assertEqual(scenes[0]["name"], "SC01")

    def test_get_task_types_for_scene(self):
        task_types = self.get("/data/scenes/%s/task-types" % self.scene.id)
        self.assertEquals(len(task_types), 1)
        self.assertDictEqual(
            task_types[0],
            self.task_type_animation.serialize()
        )
