from tests.base import ApiDBTestCase


class AssetInstanceInShotTestCase(ApiDBTestCase):

    def setUp(self):
        super(AssetInstanceInShotTestCase, self).setUp()

        self.generate_shot_suite()
        self.generate_fixture_entity()
        self.generate_fixture_asset_types()
        self.generate_fixture_entity_character()
        self.scene_id = str(self.scene.id)
        self.shot_id = str(self.shot.id)
        self.entity_id = str(self.entity.id)
        self.entity_character_id = str(self.entity_character.id)

    def new_instance(self, target_type, target_id, asset_id):
        data = {"asset_id": asset_id}
        return self.post(
            "/data/%s/%s/asset-instances" % (target_type, target_id),
            data
        )

    def new_shot_instance(self, asset_id):
        self.new_instance("shots", self.shot_id, asset_id)

    def new_scene_instance(self, asset_id):
        self.new_instance("scenes", self.scene_id, asset_id)

    def test_add_instance_to_shot(self):
        instances = self.get("/data/shots/%s/asset-instances" % self.shot_id)
        self.assertEquals(instances, {})
        self.new_shot_instance(self.entity_id)
        self.new_shot_instance(self.entity_id)
        self.new_shot_instance(self.entity_character_id)

        instances = self.get("/data/shots/%s/asset-instances" % self.shot_id)
        self.assertEquals(len(instances[self.entity_id]), 2)
        self.assertEquals(len(instances[self.entity_character_id]), 1)
        self.assertEquals(instances[self.entity_id][0]["number"], 1)
        self.assertEquals(instances[self.entity_id][1]["number"], 2)
        self.assertEquals(instances[self.entity_character_id][0]["number"], 1)

    def test_get_shot_asset_instances_for_asset(self):
        instances = self.get(
            "/data/assets/%s/shot-asset-instances" % self.entity_id
        )
        self.assertEquals(instances, {})
        self.new_shot_instance(self.entity_id)
        self.new_shot_instance(self.entity_id)
        self.new_shot_instance(self.entity_character_id)

        instances = self.get(
            "/data/assets/%s/shot-asset-instances" % self.entity_id
        )
        self.assertEquals(len(instances[self.shot_id]), 2)

    def test_add_instance_to_scene(self):
        instances = self.get(
            "/data/scenes/%s/asset-instances" % self.scene_id)
        self.assertEquals(instances, {})
        self.new_scene_instance(self.entity_id)
        self.new_scene_instance(self.entity_id)
        self.new_scene_instance(self.entity_character_id)

        instances = self.get(
            "/data/scenes/%s/asset-instances" % self.scene_id)
        self.assertEquals(len(instances[self.entity_id]), 2)
        self.assertEquals(len(instances[self.entity_character_id]), 1)
        self.assertEquals(instances[self.entity_id][0]["number"], 1)
        self.assertEquals(instances[self.entity_id][1]["number"], 2)
        self.assertEquals(instances[self.entity_character_id][0]["number"], 1)

    def test_get_scene_asset_instances_for_asset(self):
        instances = self.get(
            "/data/assets/%s/scene-asset-instances" % self.entity_id)
        self.assertEquals(instances, {})
        self.new_scene_instance(self.entity_id)
        self.new_scene_instance(self.entity_id)
        self.new_scene_instance(self.entity_character_id)

        instances = self.get(
            "/data/assets/%s/scene-asset-instances" % self.entity_id)
        self.assertEquals(len(instances[self.scene_id]), 2)
