from test.base import ApiDBTestCase

from zou.app.services import breakdown_service


class BreakdownServiceTestCase(ApiDBTestCase):

    def setUp(self):
        super(BreakdownServiceTestCase, self).setUp()
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

        casting = breakdown_service.get_casting(self.shot.id)
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
        breakdown_service.update_casting(self.shot.id, newCasting)
        casting = breakdown_service.get_casting(self.shot.id)
        casting = sorted(casting, key=lambda x: x["nb_occurences"])
        self.assertEquals(casting[0]["asset_id"], newCasting[0]["asset_id"])
        self.assertEquals(
            casting[0]["nb_occurences"],
            newCasting[0]["nb_occurences"]
        )
        self.assertEquals(casting[1]["asset_id"], newCasting[1]["asset_id"])
        self.assertEquals(
            casting[1]["nb_occurences"],
            newCasting[1]["nb_occurences"]
        )
