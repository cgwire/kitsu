from tests.base import ApiDBTestCase

from zou.app.models.entity import Entity


class BreakdownTestCase(ApiDBTestCase):

    def setUp(self):
        super(BreakdownTestCase, self).setUp()
        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_asset_type()
        self.generate_fixture_asset_types()
        self.generate_fixture_episode()
        self.generate_fixture_sequence()
        self.generate_fixture_shot()
        self.generate_fixture_asset()
        self.generate_fixture_asset_character()

    def test_update_casting(self):
        self.shot_id = str(self.shot.id)
        self.asset_id = str(self.asset.id)
        self.asset_character_id = str(self.asset_character.id)
        self.asset_type_character_id = str(self.asset_type_character.id)
        self.shot_name = self.shot.name
        self.sequence_name = self.sequence.name
        self.episode_name = self.episode.name

        casting = self.get("/data/shots/%s/casting" % self.shot_id)
        self.assertListEqual(casting, [])
        newCasting = [
            {
                "asset_id": self.asset_id,
                "nb_occurences": 1
            },
            {
                "asset_id": self.asset_character_id,
                "nb_occurences": 3
            }
        ]
        path = "/data/shots/%s/casting" % str(self.shot_id)
        self.put(path, newCasting, 200)

        casting = self.get("/data/shots/%s/casting" % self.shot_id)
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
        self.assertEquals(
            casting[1]["asset_name"],
            self.asset_character.name
        )
        self.assertEquals(
            casting[1]["asset_type_name"],
            self.asset_type_character.name
        )

        cast_in = self.get("/data/assets/%s/cast-in" % self.asset_id)
        self.assertEquals(cast_in[0]["shot_name"], self.shot.name)
        self.assertEquals(cast_in[0]["sequence_name"], self.sequence.name)
        self.assertEquals(cast_in[0]["episode_name"], self.episode.name)

    def test_get_assets_for_shots(self):
        self.entities = self.generate_data(
            Entity, 3,
            entities_out=[],
            entities_in=[],
            project_id=self.project.id,
            entity_type_id=self.asset_type.id
        )
        self.shot.entities_out = self.entities
        self.shot.save()

        assets = self.get("data/shots/%s/assets" % self.shot.id)
        self.assertEquals(len(assets), 3)
        self.assertDictEqual(
            assets[0],
            self.entities[0].serialize(obj_type="Asset")
        )
