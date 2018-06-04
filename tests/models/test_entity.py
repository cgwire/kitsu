from tests.base import ApiDBTestCase

from zou.app.utils import fields


class EntityTestCase(ApiDBTestCase):

    def setUp(self):
        super(EntityTestCase, self).setUp()
        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_asset_type()
        self.generate_fixture_asset("Asset 1")
        self.generate_fixture_asset("Asset 2")
        self.generate_fixture_asset("Asset 3")

    def test_get_entities(self):
        entities = self.get("data/entities")
        self.assertEquals(len(entities), 3)

    def test_get_entity(self):
        entity = self.get_first("data/entities")
        entity_again = self.get("data/entities/%s" % entity["id"])
        self.assertEquals(entity, entity_again)
        self.get_404("data/entities/%s" % fields.gen_uuid())

    def test_create_entity(self):
        data = {
            "name": "Cosmos Landromat",
            "description": "Video game trailer.",
            "project_id": self.project.id,
            "entity_type_id": self.asset_type.id
        }
        self.asset = self.post("data/entities", data)
        self.assertIsNotNone(self.asset["id"])

        entities = self.get("data/entities")
        self.assertEquals(len(entities), 4)

    def test_update_entity(self):
        entity = self.get_first("data/entities")
        data = {
            "name": "Cosmos Landromat 2",
            "data": {
                "extra_work": True
            }
        }
        self.put("data/entities/%s" % entity["id"], data)
        entity_again = self.get("data/entities/%s" % entity["id"])
        self.assertEquals(entity_again["name"], data["name"])
        self.assertEquals(entity_again["data"], data["data"])

        data = {
            "data": {
                "extra_field": True
            }
        }
        self.put("data/entities/%s" % entity["id"], data)
        entity_again = self.get("data/entities/%s" % entity["id"])
        self.assertEquals(entity_again["data"], {
            "extra_work": True,
            "extra_field": True
        })

        self.put_404("data/entities/%s" % fields.gen_uuid(), data)

    def test_delete_entity(self):
        entities = self.get("data/entities")
        self.assertEquals(len(entities), 3)
        entity = entities[0]
        self.delete("data/entities/%s" % entity["id"])
        entities = self.get("data/entities")
        self.assertEquals(len(entities), 2)
        self.delete_404("data/entities/%s" % fields.gen_uuid())
