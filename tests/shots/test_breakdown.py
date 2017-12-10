from tests.base import ApiDBTestCase


class BreakdownTestCase(ApiDBTestCase):

    def setUp(self):
        super(BreakdownTestCase, self).setUp()
        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_entity_type()
        self.generate_fixture_asset_types()
        self.generate_fixture_episode()
        self.generate_fixture_sequence()
        self.generate_fixture_shot()
        self.generate_fixture_entity()
        self.generate_fixture_entity_character()

    def test_update_casting(self):
        self.shot_id = str(self.shot.id)
        self.entity_id = str(self.entity.id)
        self.entity_character_id = str(self.entity_character.id)

        casting = self.get("/data/shots/%s/casting" % self.shot_id)
        self.assertListEqual(casting, [])
        newCasting = [
            {
                "asset_id": self.entity_id,
                "nb_occurences": 1
            },
            {
                "asset_id": self.entity_character_id,
                "nb_occurences": 3
            }
        ]
        path = "/data/shots/%s/casting" % str(self.shot_id)
        self.put(path, newCasting, 200)
        casting = self.get("/data/shots/%s/casting" % self.shot_id)
        self.assertListEqual(casting, newCasting)
