from tests.base import ApiDBTestCase

from zou.app.services import scenes_service


class SceneUtilsTestCase(ApiDBTestCase):

    def setUp(self):
        super(SceneUtilsTestCase, self).setUp()

        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_asset_type()
        self.generate_fixture_episode()
        self.generate_fixture_sequence()
        self.generate_fixture_scene()
        self.generate_fixture_asset()
        self.shot_01 = self.generate_fixture_shot().serialize()
        self.shot_02 = self.generate_fixture_shot("S02").serialize()
        self.scene = self.scene.serialize()

    def test_add_get_shots_from_scene(self):
        scenes_service.add_shot_to_scene(self.scene, self.shot_01)
        scenes_service.add_shot_to_scene(self.scene, self.shot_02)
        shots = scenes_service.get_shots_by_scene(self.scene["id"])
        self.assertEqual(len(shots), 2)
        self.assertEqual(shots[0]["id"], self.shot_01["id"])
        self.assertEqual(shots[1]["id"], self.shot_02["id"])

    def test_remove_shot_from_scene(self):
        scenes_service.add_shot_to_scene(self.scene, self.shot_01)
        scenes_service.add_shot_to_scene(self.scene, self.shot_02)
        scenes_service.remove_shot_from_scene(self.scene, self.shot_01)
        shots = scenes_service.get_shots_by_scene(self.scene["id"])
        self.assertEqual(len(shots), 1)
        self.assertEqual(shots[0]["id"], self.shot_02["id"])
