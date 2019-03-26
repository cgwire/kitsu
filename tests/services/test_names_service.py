from tests.base import ApiDBTestCase

from zou.app.services import files_service, names_service


class NamesServiceTestCase(ApiDBTestCase):

    def setUp(self):
        super(NamesServiceTestCase, self).setUp()

        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_asset_type()
        self.generate_fixture_asset()
        self.generate_fixture_episode()
        self.generate_fixture_sequence()
        self.generate_fixture_shot()
        self.sequence_dict = self.sequence.serialize()
        self.generate_fixture_person()
        self.generate_fixture_assigner()
        self.generate_fixture_department()
        self.generate_fixture_task_type()
        self.task_type_dict = self.task_type_animation.serialize()
        self.generate_fixture_task_status()
        self.asset_task = self.generate_fixture_task().serialize()
        self.shot_task = self.generate_fixture_shot_task().serialize()

    def test_get_full_entity_name(self):
        (asset_name, episode_id) = \
            names_service.get_full_entity_name(self.asset.id)
        (shot_name, episode_id) = \
            names_service.get_full_entity_name(self.shot.id)
        self.assertEquals(asset_name, "Props / Tree")
        self.assertEquals(shot_name, "E01 / S01 / P01")

    def test_get_preview_file_name(self):
        preview_file = files_service.create_preview_file(
            "main",
            3,
            self.shot_task["id"],
            self.user["id"],
            source="webgui"
        )
        name = names_service.get_preview_file_name(preview_file["id"])
        self.assertEqual(name, "cosmos_landromat_e01_s01_p01_animation_v3.mp4")

        preview_file = files_service.create_preview_file(
            "main",
            3,
            self.asset_task["id"],
            self.user["id"],
            source="webgui"
        )
        name = names_service.get_preview_file_name(preview_file["id"])
        self.assertEqual(name, "cosmos_landromat_props_tree_shaders_v3.mp4")
