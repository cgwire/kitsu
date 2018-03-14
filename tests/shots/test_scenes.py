from tests.base import ApiDBTestCase


class SceneTestCase(ApiDBTestCase):

    def setUp(self):
        super(SceneTestCase, self).setUp()
        self.generate_shot_suite()
        self.serialized_scene = self.scene.serialize(obj_type="Scene")
        self.serialized_sequence = self.sequence.serialize(obj_type="Sequence")
        self.sequence_id = self.sequence.id
        self.generate_fixture_shot("S02")
        self.generate_fixture_scene("SC02")
        self.generate_fixture_scene("SC03")
        self.generate_fixture_scene("SC04")
        self.generate_assigned_task()

        self.generate_fixture_sequence("S02")
        self.generate_fixture_sequence("S03")
        self.generate_fixture_sequence("S04")

    def test_get_project_scenes(self):
        scenes = self.get("data/projects/%s/scenes" % self.project.id)
        print([scene["name"] for scene in scenes])
        self.assertEquals(len(scenes), 4)
        self.assertDictEqual(scenes[0], self.serialized_scene)
        self.get("data/projects/123/scenes", 404)

        self.generate_fixture_user_cg_artist()
        self.log_in_cg_artist()
        self.get("data/projects/%s/scenes" % self.project.id, 403)
        self.log_in_admin()

    def test_get_sequence_scenes(self):
        scenes = self.get("data/sequences/%s/scenes" % self.sequence_id)
        self.assertEquals(len(scenes), 4)
        self.assertDictEqual(scenes[0], self.serialized_scene)

    def test_get_scene(self):
        scene = self.get("data/scenes/%s" % self.scene.id)
        self.assertEquals(scene["id"], str(self.scene.id))
        self.assertEquals(scene["name"], self.scene.name)
        self.assertEquals(
            scene["sequence_name"], self.serialized_sequence["name"])
        self.assertEquals(
            scene["sequence_id"], str(self.serialized_sequence["id"]))
        self.assertEquals(scene["episode_name"], self.episode.name)
        self.assertEquals(scene["episode_id"], str(self.episode.id))
        self.assertEquals(scene["project_name"], self.project.name)

    def test_create_scene(self):
        scene_name = "NSC01"
        project_id = str(self.project.id)
        sequence_id = str(self.sequence.id)
        data = {"name": scene_name, "sequence_id": sequence_id}
        scene = self.post("data/projects/%s/scenes" % project_id, data)
        scene = self.get("data/scenes/%s" % scene["id"])
        self.assertEquals(scene["name"], scene_name)
        self.assertEquals(scene["parent_id"], sequence_id)

    def test_get_remove_scene(self):
        self.get("data/scenes/%s" % self.scene.id, 200)
        self.delete("data/scenes/%s" % self.scene.id)
        self.get("data/scenes/%s" % self.scene.id, 404)

    def test_get_scene_tasks(self):
        self.generate_fixture_scene_task()
        tasks = self.get("data/scenes/%s/tasks" % self.scene.id)
        self.assertEquals(len(tasks), 1)
        self.assertEqual(tasks[0]["id"], str(self.scene_task.id))

    def test_get_scene_task_types(self):
        self.generate_fixture_scene_task()
        task_type_id = str(self.scene_task.task_type_id)
        task_types = self.get("data/scenes/%s/task-types" % self.scene.id)
        self.assertEquals(len(task_types), 1)
        self.assertEqual(task_types[0]["id"], task_type_id)
