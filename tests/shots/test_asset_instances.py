from tests.base import ApiDBTestCase


class AssetInstanceInShotTestCase(ApiDBTestCase):

    def setUp(self):
        super(AssetInstanceInShotTestCase, self).setUp()

        self.generate_shot_suite()
        self.generate_fixture_asset()
        self.generate_fixture_asset_types()
        self.generate_fixture_asset_character()
        self.scene_id = str(self.scene.id)
        self.shot_id = str(self.shot.id)
        self.asset_id = str(self.asset.id)
        self.asset_name = str(self.asset.name)
        self.asset_type_name = str(self.asset_type.name)
        self.asset_character_id = str(self.asset_character.id)

    def new_instance(self, target_type, target_id, asset_id):
        data = {"asset_id": asset_id}
        return self.post(
            "/data/%s/%s/asset-instances" % (target_type, target_id),
            data
        )

    def new_scene_instance(self, scene_id, asset_id):
        data = {"asset_id": asset_id}
        return self.post("/data/scenes/%s/asset-instances" % scene_id, data)

    def new_shot_instance(self, shot_id, asset_instance_id):
        data = {"asset_instance_id": asset_instance_id}
        return self.post("/data/shots/%s/asset-instances" % shot_id, data)

    def test_add_instance_to_scene(self):
        instances = self.get(
            "/data/scenes/%s/asset-instances" % self.scene_id)
        self.assertEquals(instances, {})
        self.new_scene_instance(self.scene.id, self.asset_id)
        self.new_scene_instance(self.scene.id, self.asset_id)
        self.new_scene_instance(self.scene.id, self.asset_character_id)

        instances = self.get(
            "/data/scenes/%s/asset-instances" % self.scene_id)
        self.assertEquals(len(instances[self.asset_id]), 2)
        self.assertEquals(len(instances[self.asset_character_id]), 1)
        self.assertEquals(instances[self.asset_id][0]["number"], 1)
        self.assertEquals(instances[self.asset_id][1]["number"], 2)
        self.assertEquals(
            instances[self.asset_id][1]["name"],
            "tree_0002"
        )
        self.assertEquals(instances[self.asset_character_id][0]["number"], 1)

    def test_get_scene_asset_instances_for_asset(self):
        instances = self.get(
            "/data/assets/%s/scene-asset-instances" % self.asset_id)
        self.assertEquals(instances, {})
        self.new_scene_instance(self.scene_id, self.asset_id)
        self.new_scene_instance(self.scene_id, self.asset_id)
        self.new_scene_instance(self.scene_id, self.asset_character_id)

        instances = self.get(
            "/data/assets/%s/scene-asset-instances" % self.asset_id)
        self.assertEquals(len(instances[self.scene_id]), 2)

    def test_get_scene_camera_instances_for_asset(self):
        self.generate_fixture_asset_camera()
        self.asset_camera_id = self.asset_camera.id
        instances = self.get(
            "/data/scenes/%s/camera-instances" % self.scene_id)
        self.assertEquals(instances, {})
        self.new_scene_instance(self.scene_id, self.asset_id)
        self.new_scene_instance(self.scene_id, self.asset_id)
        self.new_scene_instance(self.scene_id, self.asset_character_id)
        self.new_scene_instance(self.scene_id, self.asset_camera_id)
        self.new_scene_instance(self.scene_id, self.asset_camera_id)
        self.new_scene_instance(self.scene_id, self.asset_camera_id)
        instances = self.get(
            "/data/scenes/%s/camera-instances" % self.scene_id)
        self.assertEquals(len(instances[str(self.asset_camera_id)]), 3)
        self.assertTrue(self.asset_id not in instances)

    def test_add_instance_to_shot(self):
        instances = self.get("/data/shots/%s/asset-instances" % self.shot_id)
        self.assertEquals(instances, {})

        asset_instance = self.new_scene_instance(self.scene_id, self.asset_id)
        self.new_shot_instance(self.shot_id, asset_instance["id"])
        asset_instance = self.new_scene_instance(self.scene_id, self.asset_id)
        self.new_shot_instance(self.shot_id, asset_instance["id"])
        asset_instance = self.new_scene_instance(
            self.scene_id,
            self.asset_character_id
        )
        self.new_shot_instance(self.shot_id, asset_instance["id"])

        instances = self.get("/data/shots/%s/asset-instances" % self.shot_id)
        self.assertEquals(len(instances[self.asset_id]), 2)
        self.assertEquals(len(instances[self.asset_character_id]), 1)
        self.assertEquals(instances[self.asset_id][0]["number"], 1)
        self.assertEquals(instances[self.asset_id][1]["number"], 2)
        self.assertEquals(
            instances[self.asset_id][1]["name"],
            "tree_0002"
        )
        self.assertEquals(instances[self.asset_character_id][0]["number"], 1)

        self.delete(
            "/data/shots/%s/asset-instances/%s" % (
                self.shot_id,
                asset_instance["id"]
            )
        )
        instances = self.get("/data/shots/%s/asset-instances" % self.shot_id)
        self.assertTrue(self.asset_character_id not in instances)

    def test_get_shot_asset_instances_for_asset(self):
        instances = self.get(
            "/data/assets/%s/shot-asset-instances" % self.asset_id
        )
        self.assertEquals(instances, {})
        asset_instance = self.new_scene_instance(self.scene_id, self.asset_id)
        self.new_shot_instance(self.shot_id, asset_instance["id"])
        asset_instance = self.new_scene_instance(self.scene_id, self.asset_id)
        self.new_shot_instance(self.shot_id, asset_instance["id"])
        asset_instance = self.new_scene_instance(
            self.scene_id,
            self.asset_character_id
        )
        self.new_shot_instance(self.shot_id, asset_instance["id"])

        instances = self.get(
            "/data/assets/%s/shot-asset-instances" % self.asset_id
        )
        self.assertEquals(len(instances[self.shot_id]), 2)
