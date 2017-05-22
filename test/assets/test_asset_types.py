from test.base import ApiDBTestCase


class AssetTypesTestCase(ApiDBTestCase):

    def setUp(self):
        super(AssetTypesTestCase, self).setUp()
        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_entity_type()
        self.generate_fixture_sequence()
        self.generate_fixture_shot()

    def test_get_asset_types(self):
        asset_types = self.get("data/asset_types")
        self.assertEquals(len(asset_types), 1)
        self.assertDictEqual(asset_types[0], self.entity_type.serialize())
