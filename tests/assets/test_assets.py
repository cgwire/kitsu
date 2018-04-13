from tests.base import ApiDBTestCase

from zou.app.services import assets_service
from zou.app.models.entity import Entity

from zou.app.utils import events


class AssetsTestCase(ApiDBTestCase):

    def setUp(self):
        super(AssetsTestCase, self).setUp()
        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_asset_type()
        self.generate_fixture_asset()
        self.generate_fixture_sequence()
        self.generate_fixture_shot()
        self.generate_fixture_person()
        self.generate_fixture_assigner()
        self.generate_fixture_department()
        self.generate_fixture_task_status()
        self.generate_fixture_task_type()
        self.generate_fixture_task()
        self.generate_fixture_task(name="Secondary")
        self.asset_dict = self.asset.serialize(obj_type="Asset")
        self.maxDiff = None

        self.is_event_fired = False
        events.unregister_all()

    def handle_event(self, data):
        self.is_event_fired = True
        self.assertEqual(
            data["asset"]["name"],
            self.asset_data["name"]
        )
        self.assertEqual(
            data["asset_type"]["id"],
            str(self.asset_type.id)
        )
        self.assertEqual(
            data["project"]["id"],
            str(self.project.id)
        )

    def test_get_assets(self):
        assets = self.get("data/assets/all")
        self.assertEquals(len(assets), 1)
        self.assertEquals(assets[0]["name"], self.asset_dict["name"])

    def test_get_asset(self):
        asset = self.get("data/assets/%s" % self.asset.id)
        self.assertEquals(asset["id"], str(self.asset.id))
        self.assertEquals(asset["project_name"], self.project.name)
        self.assertEquals(asset["entity_type_id"], str(self.asset_type.id))
        self.assertEquals(asset["asset_type_name"], str(self.asset_type.name))
        self.assertEquals(len(asset["tasks"]), 2)

    def test_get_asset_by_name(self):
        assets = self.get("data/assets/all?name=%s" % self.asset.name.lower())
        self.assertEquals(assets[0]["id"], str(self.asset.id))

    def test_get_project_assets(self):
        assets = self.get("data/projects/%s/assets" % self.project.id)
        self.assertEquals(len(assets), 1)
        self.assertEquals(assets[0]["type"], "Asset")

    def test_get_shot_assets(self):
        assets = self.get("data/shots/%s/assets" % self.shot.id)
        self.assertEquals(len(assets), 0)

        self.shot.entities_out = [self.asset]
        self.shot.save()
        assets = self.get("data/shots/%s/assets" % self.shot.id)
        self.assertEquals(len(assets), 1)
        self.assertEquals(assets[0]["type"], "Asset")

    def test_get_project_and_type_assets(self):
        asset_type = assets_service.get_or_create_asset_type("VFX")
        Entity.create(
            name="Smoke",
            entity_type_id=asset_type["id"],
            project_id=self.project.id
        )
        path_ids = (self.project.id, self.asset_type.id)
        path = "data/projects/%s/asset-types/%s/assets" % path_ids
        assets = self.get(path)
        self.assertEquals(len(assets), 1)
        self.assertDictEqual(assets[0], self.asset_dict)

    def test_create_asset(self):
        events.register(
            "asset:new",
            "handle_event",
            self
        )
        self.asset_data = {
            "name": "car",
            "description": "Test description",
            "data": {"extra": "test extra"}
        }
        path = "data/projects/%s/asset-types/%s/assets/new" % (
            self.project.id,
            self.asset_type.id
        )
        asset = self.post(path, self.asset_data)
        assets = assets_service.get_assets()
        self.assertIsNotNone(asset.get("id", None))
        self.assertEquals(len(assets), 2)
        self.assertEquals(
            assets[1]["name"],
            self.asset_data["name"]
        )
        self.assertEquals(
            assets[1]["description"],
            self.asset_data["description"]
        )
        self.assertDictEqual(
            assets[1]["data"],
            self.asset_data["data"]
        )

    def test_remove_asset(self):
        self.generate_fixture_asset_types()
        self.generate_fixture_asset_character()
        path = "data/assets/%s" % self.asset_character.id
        self.delete(path)
        assets = assets_service.get_assets()
        self.assertEquals(len(assets), 1)
        self.get(path, 404)

    def test_remove_asset_with_tasks(self):
        path = "data/assets/%s" % self.asset.id
        self.delete(path)
        assets = assets_service.get_assets()
        self.assertEquals(len(assets), 1)
        self.assertEquals(assets[0]["canceled"], True)
