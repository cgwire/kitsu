from test.base import ApiDBTestCase


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
        newCasting = [
            str(self.entity.id),
            str(self.entity_character.id),
        ]
        path = "/actions/shots/%s/casting" % str(self.shot.id)
        self.put(path, newCasting, 200)
        shot = self.get("/data/shots/%s/" % self.shot_id)
        self.assertEquals(shot["entities_out"], newCasting)
