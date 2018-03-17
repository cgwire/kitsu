from tests.base import ApiDBTestCase
from zou.app.models.entity import Entity


class ShotAssetsTestCase(ApiDBTestCase):

    def setUp(self):
        super(ShotAssetsTestCase, self).setUp()
        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_asset_type()
        self.generate_fixture_sequence()
        self.generate_fixture_shot()
        self.entities = self.generate_data(
            Entity, 3,
            entities_out=[],
            entities_in=[],
            project_id=self.project.id,
            entity_type_id=self.asset_type.id
        )
        self.shot.entities_out = self.entities
        self.shot.save()

    def test_get_assets_for_shots(self):
        assets = self.get("data/shots/%s/assets" % self.shot.id)
        self.assertEquals(len(assets), 3)
        self.assertDictEqual(
            assets[0],
            self.entities[0].serialize(obj_type="Asset")
        )
