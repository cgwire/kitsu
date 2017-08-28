from test.base import ApiDBTestCase


class AssetTypesTestCase(ApiDBTestCase):

    def setUp(self):
        super(AssetTypesTestCase, self).setUp()
        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_entity_type()
        self.generate_fixture_entity()
        self.generate_fixture_sequence()
        self.generate_fixture_shot()

    def test_get_asset_types(self):
        asset_types = self.get("data/asset-types")
        self.assertEquals(len(asset_types), 1)
        self.assertDictEqual(
            asset_types[0],
            self.entity_type.serialize("AssetType")
        )

    def test_get_asset_type(self):
        asset_type = self.get("data/asset-types/%s" % self.entity_type.id)
        self.assertDictEqual(
            asset_type,
            self.entity_type.serialize(obj_type="AssetType")
        )

    def test_get_project_asset_types(self):
        asset_types = self.get("data/projects/%s/asset-types" % self.project.id)
        self.assertEquals(len(asset_types), 1)
        self.assertDictEqual(
            asset_types[0],
            self.entity_type.serialize(obj_type="AssetType")
        )

    def test_get_shot_asset_types(self):
        asset_types = self.get("data/shots/%s/asset-types" % self.shot.id)
        self.assertEquals(len(asset_types), 0)

        self.shot.entities_out = [self.entity]
        self.shot.save()

        asset_types = self.get("data/shots/%s/asset-types" % self.shot.id)
        self.assertEquals(len(asset_types), 1)
        self.assertEqual(asset_types[0]["type"], "AssetType")
