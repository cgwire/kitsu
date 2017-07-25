from test.base import ApiDBTestCase

from zou.app.project import asset_info
from zou.app.project.exception import AssetNotFoundException


class AssetInfoTestCase(ApiDBTestCase):

    def setUp(self):
        super(AssetInfoTestCase, self).setUp()

        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_entity_type()
        self.generate_fixture_entity()
        self.generate_fixture_sequence()
        self.generate_fixture_shot()

    def test_get_asset_types(self):
        asset_types = asset_info.get_asset_types()
        self.assertEqual(len(asset_types), 1)
        self.assertEqual(asset_types[0].name, "Props")

    def test_get_assets(self):
        assets = asset_info.get_assets()
        self.assertEqual(len(assets), 1)
        self.assertEqual(assets[0].name, "Tree")

    def test_get_assets_and_tasks(self):
        self.generate_fixture_person()
        self.generate_fixture_assigner()
        self.generate_fixture_department()
        self.generate_fixture_task_status()
        self.generate_fixture_task_type()
        self.generate_fixture_task()
        self.generate_fixture_task(name="Secondary")
        assets = asset_info.all_assets_and_tasks()
        self.assertEqual(len(assets), 1)
        self.assertEqual(len(assets[0]["tasks"]), 2)
        self.assertEqual(
            assets[0]["tasks"][0]["task_status_name"], "Open"
        )
        self.assertEqual(
            assets[0]["tasks"][0]["task_type_name"], "Shaders"
        )

    def test_get_asset(self):
        asset = asset_info.get_asset(self.entity.id)
        self.assertEqual(asset.id, self.entity.id)
        asset.delete()
        self.assertRaises(
            AssetNotFoundException,
            asset_info.get_asset,
            self.entity.id
        )

    def test_is_asset(self):
        self.assertTrue(asset_info.is_asset(self.entity))
        self.assertFalse(asset_info.is_asset(self.shot))
