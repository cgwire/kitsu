from test.base import ApiDBTestCase

from zou.app.project import asset_info


class CreateAssetsTestCase(ApiDBTestCase):

    def setUp(self):
        super(CreateAssetsTestCase, self).setUp()

        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_entity_type()

    def test_create_asset(self):
        data = {
            "name": "car",
            "description": "Test description"
        }
        path = "data/projects/%s/asset-types/%s/assets/new" % (
            self.project.id,
            self.entity_type.id
        )
        asset = self.post(path, data)
        assets = asset_info.get_assets()
        self.assertIsNotNone(asset.get("id", None))
        self.assertEquals(len(assets), 1)
        self.assertEquals(assets[0].name, data["name"].capitalize())
        self.assertEquals(assets[0].description, data["description"])

    def test_remove_asset(self):
        self.generate_fixture_entity()
        path = "data/projects/%s/asset-types/%s/assets/%s" % (
            self.project.id,
            self.entity_type.id,
            self.entity.id
        )
        self.delete(path)
        assets = asset_info.get_assets()
        self.assertEquals(len(assets), 0)
