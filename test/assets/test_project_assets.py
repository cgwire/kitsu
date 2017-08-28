from test.base import ApiDBTestCase

from zou.app.models.entity import Entity
from zou.app.models.entity_type import EntityType


class ProjectAssetsTestCase(ApiDBTestCase):

    def setUp(self):
        super(ProjectAssetsTestCase, self).setUp()
        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_project_standard()
        self.generate_fixture_entity_type()
        self.generate_fixture_entity()
        self.generate_fixture_entity_standard()
        self.generate_fixture_sequence()
        self.generate_fixture_shot()
        self.entity_dict = self.entity.serialize(obj_type="Asset")

    def test_get_project_assets(self):
        assets = self.get("data/projects/%s/assets" % self.project.id)
        self.assertEquals(len(assets), 1)
        self.assertDictEqual(assets[0], self.entity_dict)

    def test_get_project_and_type_assets(self):
        entity_type = EntityType(
            name="VFX"
        )
        entity_type.save()
        entity = Entity(
            name="Smoke",
            entity_type_id=entity_type.id,
            project_id=self.project.id
        )
        entity.save()
        path_ids = (self.project.id, self.entity_type.id)
        path = "data/projects/%s/asset-types/%s/assets" % path_ids
        assets = self.get(path)
        self.assertEquals(len(assets), 1)
        self.assertDictEqual(assets[0], self.entity_dict)
