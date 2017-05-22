from test.base import ApiDBTestCase

from zou.app.models.entity_type import EntityType

from zou.app.utils import fields


class EntityTypeTestCase(ApiDBTestCase):

    def setUp(self):
        super(EntityTypeTestCase, self).setUp()
        self.generate_data(EntityType, 3)

    def test_get_entity_types(self):
        entity_types = self.get("data/entity_types")
        self.assertEquals(len(entity_types), 3)

    def test_get_entity_types_again(self):
        entity_types = self.get_first("data/entity_types")
        entity_types_again = self.get(
            "data/entity_types/%s" % entity_types["id"])
        self.assertEquals(entity_types, entity_types_again)
        self.get_404("data/entity_types/%s" % fields.gen_uuid())

    def test_create_entity_types(self):
        data = {
            "name": "shot"
        }
        self.entity_types = self.post("data/entity_types", data)
        self.assertIsNotNone(self.entity_types["id"])

        entity_types = self.get("data/entity_types")
        self.assertEquals(len(entity_types), 4)

    def test_update_entity_types(self):
        entity_types = self.get_first("data/entity_types")
        data = {
            "name": "sequence"
        }
        self.put("data/entity_types/%s" % entity_types["id"], data)
        entity_types_again = self.get(
            "data/entity_types/%s" % entity_types["id"])
        self.assertEquals(data["name"], entity_types_again["name"])
        self.put_404("data/entity_types/%s" % fields.gen_uuid(), data)

    def test_delete_entity_types(self):
        entity_types = self.get("data/entity_types")
        self.assertEquals(len(entity_types), 3)
        entity_types = entity_types[0]
        self.delete("data/entity_types/%s" % entity_types["id"])
        entity_types = self.get("data/entity_types")
        self.assertEquals(len(entity_types), 2)
        self.delete_404("data/entity_types/%s" % fields.gen_uuid())
