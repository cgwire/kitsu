from tests.base import ApiDBTestCase

from zou.app.models.entity import Entity
from zou.app.models.project import Project
from zou.app.models.entity_type import EntityType


class QueryTestCase(ApiDBTestCase):

    def setUp(self):
        super(QueryTestCase, self).setUp()
        self.generate_fixture_project_status()
        self.generate_fixture_project()

        self.project_id = self.project.id
        project = Project(name='Kitchen',
                          project_status_id=self.open_status.id)
        project.save()

        self.project2_id = project.id

        self.asset_type = EntityType(name='Shot Cosmos Landromat')
        self.asset_type.save()

        self.generate_data(Entity, 3,
                           entities_out=[],
                           entities_in=[],
                           project_id=self.project_id,
                           entity_type_id=self.asset_type.id)
        self.generate_data(Entity, 2,
                           entities_out=[],
                           entities_in=[],
                           project_id=self.project2_id,
                           entity_type_id=self.asset_type.id)

    def test_get_by_name(self):
        entities = self.get("data/entities")
        self.assertEquals(len(entities), 5)
        entities = self.get("data/entities?name=%s" % entities[0]['name'])
        self.assertEquals(len(entities), 1)
        entities = self.get("data/entities?name=%s&project_id=%s" % (
            entities[0]['name'], self.project_id))
        self.assertEquals(len(entities), 1)
        entities = self.get("data/entities?name=%s&project_id=%s" % (
            entities[0]['name'], self.project2_id))
        self.assertEquals(len(entities), 0)
