from tests.base import ApiDBTestCase


class AssetInstanceInShotTestCase(ApiDBTestCase):

    def setUp(self):
        super(AssetInstanceInShotTestCase, self).setUp()

        self.generate_shot_suite()
        self.generate_fixture_entity()
        self.generate_fixture_asset_types()
        self.generate_fixture_entity_character()
        self.shot_id = str(self.shot.id)
        self.entity_id = str(self.entity.id)
        self.entity_character_id = str(self.entity_character.id)

    def new_instance(self, asset_id):
        data = {"asset_id": asset_id}
        return self.post(
            "/data/shots/%s/asset-instances" % self.shot.id,
            data
        )

    def test_add_instance_to_shot(self):
        instances = self.get("/data/shots/%s/asset-instances" % self.shot_id)
        self.assertEquals(instances, {})
        self.new_instance(self.entity_id)
        self.new_instance(self.entity_id)
        self.new_instance(self.entity_character_id)

        instances = self.get("/data/shots/%s/asset-instances" % self.shot_id)
        self.assertEquals(len(instances[self.entity_id]), 2)
        self.assertEquals(len(instances[self.entity_character_id]), 1)
        self.assertEquals(instances[self.entity_id][0]["number"], 1)
        self.assertEquals(instances[self.entity_id][1]["number"], 2)
        self.assertEquals(instances[self.entity_character_id][0]["number"], 1)

    def test_get_asset_instances_for_asset(self):
        instances = self.get(
            "/data/assets/%s/asset-instances" % self.entity_id
        )
        self.assertEquals(instances, {})
        self.new_instance(self.entity_id)
        self.new_instance(self.entity_id)
        self.new_instance(self.entity_character_id)

        instances = self.get(
            "/data/assets/%s/asset-instances" % self.entity_id
        )
        self.assertEquals(len(instances[self.shot_id]), 2)
