from test.base import ApiDBTestCase

from zou.app.models.entity import Entity


class SequenceTestCase(ApiDBTestCase):

    def setUp(self):
        super(SequenceTestCase, self).setUp()
        self.generate_shot_suite()
        self.generate_assigned_task()

        self.generate_data(
            Entity,
            3,
            entities_out=[],
            entities_in=[],
            project_id=self.project.id,
            parent_id=self.sequence.id,
            entity_type_id=self.scene_type.id,
        )
        self.generate_data(
            Entity,
            2,
            entities_out=[],
            entities_in=[],
            project_id=self.project.id,
            entity_type_id=self.shot_type.id
        )

    def test_get_project_scenes(self):
        scenes = self.get("data/projects/%s/scenes" % self.project.id)
        self.assertEquals(len(scenes), 4)
        self.assertDictEqual(
            scenes[0],
            self.scene.serialize(obj_type="Scene")
        )
        self.get("data/projects/123/scenes", 404)

        self.generate_fixture_user_cg_artist()
        self.log_in_cg_artist()
        self.get("data/projects/%s/scenes" % self.project.id, 403)
        self.log_in_admin()

    def test_get_sequence_scenes(self):
        scenes = self.get("data/sequences/%s/scenes" % self.sequence.id)
        self.assertEquals(len(scenes), 4)
        self.assertDictEqual(
            scenes[0],
            self.scene.serialize(obj_type="Scene")
        )

    def test_get_scene(self):
        scene = self.get("data/scenes/%s" % self.scene.id)
        self.assertDictEqual(
            scene,
            self.scene.serialize(obj_type="Scene")
        )

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
