from test.base import ApiDBTestCase

from zou.app.services import assets_service
from zou.app.services.exception import AssetNotFoundException


class AssetServiceTestCase(ApiDBTestCase):

    def setUp(self):
        super(AssetServiceTestCase, self).setUp()

        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_entity_type()
        self.generate_fixture_entity()
        self.generate_fixture_sequence()
        self.generate_fixture_shot()

    def test_get_asset_types(self):
        asset_types = assets_service.get_asset_types()
        self.assertEqual(len(asset_types), 1)
        self.assertEqual(asset_types[0]["name"], "Props")

    def test_get_asset_types_for_project(self):
        asset_types = assets_service.get_asset_types_for_project(
            self.project.id
        )
        self.assertEqual(len(asset_types), 1)
        self.assertEqual(asset_types[0]["name"], "Props")

    def test_get_asset_types_for_shot(self):
        self.shot.entities_out = [self.entity]
        self.shot.save()
        asset_types = assets_service.get_asset_types_for_shot(self.shot.id)
        self.assertEqual(len(asset_types), 1)
        self.assertEqual(asset_types[0]["name"], "Props")

    def test_get_assets(self):
        assets = assets_service.get_assets()
        self.assertEqual(len(assets), 1)
        self.assertEqual(assets[0]["name"], "Tree")

    def test_get_asset_map(self):
        self.generate_fixture_asset_types()
        self.generate_fixture_entity_character()
        asset_map = assets_service.get_asset_map()
        self.assertEquals(len(asset_map.keys()), 2)
        self.assertEquals(
            asset_map[str(self.entity.id)]["name"],
            self.entity.name
        )

    def test_get_assets_and_tasks(self):
        self.generate_fixture_asset_types()
        self.generate_fixture_entity_character()
        self.generate_fixture_person()
        self.generate_fixture_assigner()
        self.generate_fixture_department()
        self.generate_fixture_task_status()
        self.generate_fixture_task_type()
        self.generate_fixture_task()
        self.generate_fixture_task(name="Secondary")
        assets = assets_service.all_assets_and_tasks()
        self.assertEqual(len(assets), 2)
        assets = sorted(assets, key=lambda asset: asset["name"])
        self.assertEqual(len(assets[1]["tasks"]), 2)
        self.assertEqual(
            assets[1]["tasks"][0]["task_status_name"], "Open"
        )
        self.assertEqual(
            assets[1]["tasks"][0]["task_type_name"], "Shaders"
        )
        self.assertEqual(
            assets[1]["tasks"][0]["assignees"][0], str(self.person.id)
        )

    def test_get_asset(self):
        asset = assets_service.get_asset(self.entity.id)
        self.assertEqual(asset["id"], str(self.entity.id))
        assets_service.remove_asset(asset["id"])
        self.assertRaises(
            AssetNotFoundException,
            assets_service.get_asset,
            self.entity.id
        )

    def test_get_asset_by_shotgun_id(self):
        self.shot.update({"shotgun_id": 1})
        self.entity.update({"shotgun_id": 1})
        asset = assets_service.get_asset_by_shotgun_id(1)
        self.assertEqual(asset["id"], str(self.entity.id))
        assets_service.remove_asset(asset["id"])
        self.assertRaises(
            AssetNotFoundException,
            assets_service.get_asset_by_shotgun_id,
            1
        )

    def test_is_asset(self):
        self.assertTrue(assets_service.is_asset(self.entity))
        self.assertFalse(assets_service.is_asset(self.shot))

    def test_cancel_asset(self):
        asset_id = self.entity.id
        assets_service.cancel_asset(asset_id)
        asset = assets_service.get_asset(asset_id)
        self.assertTrue(asset["canceled"])

    def test_remove_asset(self):
        asset_id = self.entity.id
        assets_service.remove_asset(asset_id)
        self.assertRaises(
            AssetNotFoundException,
            assets_service.get_asset,
            asset_id
        )
