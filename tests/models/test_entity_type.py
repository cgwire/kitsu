from tests.base import ApiDBTestCase

from zou.app.models.entity_type import EntityType

from zou.app.utils import fields


class EntityTypeTestCase(ApiDBTestCase):

    def setUp(self):
        super(EntityTypeTestCase, self).setUp()
        self.generate_data(EntityType, 3)

    def test_get_entity_types(self):
        entity_types = self.get("data/entity-types")
        self.assertEquals(len(entity_types), 3)

    def test_get_entity_types_again(self):
        entity_types = self.get_first("data/entity-types")
        entity_types_again = self.get(
            "data/entity-types/%s" % entity_types["id"])
        self.assertEquals(entity_types, entity_types_again)
        self.get_404("data/entity-types/%s" % fields.gen_uuid())

    def test_create_entity_types(self):
        data = {
            "name": "shot"
        }
        self.asset_types = self.post("data/entity-types", data)
        self.assertIsNotNone(self.asset_types["id"])

        entity_types = self.get("data/entity-types")
        self.assertEquals(len(entity_types), 4)

    def test_update_entity_types(self):
        entity_types = self.get_first("data/entity-types")
        data = {
            "name": "sequence"
        }
        self.put("data/entity-types/%s" % entity_types["id"], data)
        entity_types_again = self.get(
            "data/entity-types/%s" % entity_types["id"])
        self.assertEquals(data["name"], entity_types_again["name"])
        self.put_404("data/entity-types/%s" % fields.gen_uuid(), data)

    def test_delete_entity_types(self):
        entity_types = self.get("data/entity-types")
        self.assertEquals(len(entity_types), 3)
        entity_types = entity_types[0]
        self.delete("data/entity-types/%s" % entity_types["id"])
        entity_types = self.get("data/entity-types")
        self.assertEquals(len(entity_types), 2)
        self.delete_404("data/entity-types/%s" % fields.gen_uuid())
