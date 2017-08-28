from test.base import ApiDBTestCase


class AssetsTestCase(ApiDBTestCase):

    def setUp(self):
        super(AssetsTestCase, self).setUp()
        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_entity_type()
        self.generate_fixture_entity()
        self.generate_fixture_sequence()
        self.generate_fixture_shot()
        self.entity_dict = self.entity.serialize(obj_type="Asset")
        self.maxDiff = None

    def test_get_assets(self):
        assets = self.get("data/assets")
        self.assertEquals(len(assets), 1)
        self.assertDictEqual(assets[0], self.entity_dict)

    def test_get_asset(self):
        asset = self.get("data/assets/%s" % self.entity.id)
        self.assertDictEqual(asset, self.entity_dict)

    def test_get_project_assets(self):
        assets = self.get("data/projects/%s/assets" % self.project.id)
        self.assertEquals(len(assets), 1)
        self.assertEquals(assets[0]["type"], "Asset")

    def test_get_shot_assets(self):
        assets = self.get("data/shots/%s/assets" % self.shot.id)
        self.assertEquals(len(assets), 0)

        self.shot.entities_out = [self.entity]
        self.shot.save()
        assets = self.get("data/shots/%s/assets" % self.shot.id)
        self.assertEquals(len(assets), 1)
        self.assertEquals(assets[0]["type"], "Asset")
