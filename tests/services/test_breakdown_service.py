from tests.base import ApiDBTestCase

from zou.app.services import breakdown_service


class BreakdownServiceTestCase(ApiDBTestCase):

    def setUp(self):
        super(BreakdownServiceTestCase, self).setUp()
        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_asset_type()
        self.generate_fixture_asset_types()
        self.generate_fixture_episode()
        self.generate_fixture_sequence()
        self.generate_fixture_shot()
        self.generate_fixture_scene()
        self.generate_fixture_asset()
        self.generate_fixture_asset_character()
        self.shot_id = str(self.shot.id)
        self.scene_id = str(self.scene.id)
        self.asset_id = str(self.asset.id)
        self.asset_character_id = str(self.asset_character.id)

    def test_get_sequence_casting(self):
        self.shot_id = str(self.shot.id)
        self.sequence_id = str(self.sequence.id)
        self.asset_id = str(self.asset.id)
        self.asset_character_id = str(self.asset_character.id)

        casting = breakdown_service.get_casting(self.shot.id)
        self.assertListEqual(casting, [])
        new_casting = [
            {
                "asset_id": self.asset_id,
                "nb_occurences": 1
            },
            {
                "asset_id": self.asset_character_id,
                "nb_occurences": 3
            }
        ]
        breakdown_service.update_casting(self.shot.id, new_casting)
        self.generate_fixture_shot("SH02")
        new_casting = [
            {
                "asset_id": self.asset_id,
                "nb_occurences": 1
            }
        ]
        breakdown_service.update_casting(self.shot.id, new_casting)
        casting = breakdown_service.get_sequence_casting(self.sequence.id)
        self.maxDiff = 10000
        self.assertTrue(self.shot_id in casting)
        self.assertTrue(str(self.shot.id) in casting)
        self.assertEqual(len(casting[self.shot_id]), 2)
        self.assertEqual(len(casting[str(self.shot.id)]), 1)

    def new_shot_instance(self, asset_instance_id):
        return breakdown_service.add_asset_instance_to_shot(
            self.shot_id, asset_instance_id
        )

    def new_scene_instance(self, asset_id):
        return breakdown_service.add_asset_instance_to_scene(
            self.scene_id, asset_id
        )

    def test_update_casting(self):
        self.shot_id = str(self.shot.id)
        self.asset_id = str(self.asset.id)
        self.asset_character_id = str(self.asset_character.id)

        casting = breakdown_service.get_casting(self.shot.id)
        self.assertListEqual(casting, [])
        new_casting = [
            {
                "asset_id": self.asset_id,
                "nb_occurences": 1
            },
            {
                "asset_id": self.asset_character_id,
                "nb_occurences": 3
            }
        ]
        breakdown_service.update_casting(self.shot.id, new_casting)

        casting = breakdown_service.get_casting(self.shot.id)
        casting = sorted(casting, key=lambda x: x["nb_occurences"])
        self.assertEqual(casting[0]["asset_id"], new_casting[0]["asset_id"])
        self.assertEqual(
            casting[0]["nb_occurences"],
            new_casting[0]["nb_occurences"]
        )
        self.assertEqual(casting[1]["asset_id"], new_casting[1]["asset_id"])
        self.assertEqual(
            casting[1]["nb_occurences"],
            new_casting[1]["nb_occurences"]
        )
        self.assertEqual(
            casting[1]["asset_name"],
            self.asset_character.name
        )
        self.assertEqual(
            casting[1]["asset_type_name"],
            self.asset_type_character.name
        )

        cast_in = breakdown_service.get_cast_in(self.asset_character.id)
        self.assertEqual(cast_in[0]["shot_name"], self.shot.name)
        self.assertEqual(cast_in[0]["sequence_name"], self.sequence.name)
        self.assertEqual(cast_in[0]["episode_name"], self.episode.name)

    def test_add_instance_to_shot(self):
        instances = breakdown_service.get_asset_instances_for_shot(self.shot.id)
        self.assertEqual(instances, {})

        asset_instance = self.new_scene_instance(self.asset_id)
        self.new_shot_instance(asset_instance["id"])
        asset_instance = self.new_scene_instance(self.asset_id)
        self.new_shot_instance(asset_instance["id"])
        asset_instance = self.new_scene_instance(self.asset_character_id)
        self.new_shot_instance(asset_instance["id"])

        instances = breakdown_service.get_asset_instances_for_shot(self.shot.id)
        self.assertEqual(len(instances[self.asset_id]), 2)
        self.assertEqual(len(instances[self.asset_character_id]), 1)
        self.assertEqual(instances[self.asset_id][0]["number"], 1)
        self.assertEqual(instances[self.asset_id][1]["number"], 2)
        self.assertEqual(
            instances[self.asset_id][1]["name"],
            "tree_0002"
        )
        self.assertEqual(instances[self.asset_character_id][0]["number"], 1)

        instances = breakdown_service.remove_asset_instance_for_shot(
            self.shot.id, asset_instance["id"]
        )
        instances = breakdown_service.get_asset_instances_for_shot(self.shot.id)
        self.assertTrue(self.asset_character_id not in instances)

    def test_build_asset_instance_name(self):
        name = breakdown_service.build_asset_instance_name(
            self.asset_id, 3)
        self.assertEqual(name, "tree_0003")
        name = breakdown_service.build_asset_instance_name(
            self.asset_character_id, 5)
        self.assertEqual(name, "rabbit_0005")

    def test_get_shot_asset_instances_for_asset(self):
        instances = breakdown_service.get_shot_asset_instances_for_asset(
            self.asset.id
        )
        self.assertEqual(instances, {})

        asset_instance = self.new_scene_instance(self.asset_id)
        self.new_shot_instance(asset_instance["id"])
        asset_instance = self.new_scene_instance(self.asset_id)
        self.new_shot_instance(asset_instance["id"])
        asset_instance = self.new_scene_instance(self.asset_character_id)
        self.new_shot_instance(asset_instance["id"])

        instances = breakdown_service.get_shot_asset_instances_for_asset(
            self.asset.id
        )
        self.assertEqual(len(instances[self.shot_id]), 2)

    def test_add_instance_to_scene(self):
        instances = breakdown_service.get_asset_instances_for_scene(
            self.scene.id
        )
        self.assertEqual(instances, {})

        self.new_scene_instance(self.asset_id)
        self.new_scene_instance(self.asset_id)
        self.new_scene_instance(self.asset_character_id)

        instances = breakdown_service.get_asset_instances_for_scene(
            self.scene.id
        )
        self.assertEqual(len(instances[self.asset_id]), 2)
        self.assertEqual(len(instances[self.asset_character_id]), 1)
        self.assertEqual(instances[self.asset_id][0]["number"], 1)
        self.assertEqual(instances[self.asset_id][1]["number"], 2)
        self.assertEqual(instances[self.asset_character_id][0]["number"], 1)

    def test_get_scene_asset_instances_for_asset(self):
        instances = breakdown_service.get_scene_asset_instances_for_asset(
            self.asset.id
        )
        self.assertEqual(instances, {})

        self.new_scene_instance(self.asset.id)
        self.new_scene_instance(self.asset.id)
        self.new_scene_instance(self.asset_character.id)
        instances = breakdown_service.get_scene_asset_instances_for_asset(
            self.asset.id
        )
        self.assertEqual(len(instances[self.scene_id]), 2)
