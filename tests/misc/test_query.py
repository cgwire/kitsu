from tests.base import ApiDBTestCase

from zou.app.models.project import Project


class QueryTestCase(ApiDBTestCase):

    def setUp(self):
        super(QueryTestCase, self).setUp()
        self.generate_fixture_project_status()
        self.generate_fixture_project()

        self.project_id = self.project.id
        project = Project.create(
            name='Kitchen',
            project_status_id=self.open_status.id
        )
        self.project2_id = project.id

        self.generate_fixture_asset_type()
        self.generate_fixture_asset_types()
        self.generate_fixture_asset("Asset 1")
        self.generate_fixture_asset("Asset 2")
        self.generate_fixture_asset("Asset 3")
        self.generate_fixture_asset_character("Asset char 1")
        self.generate_fixture_asset_character("Asset char 2")

    def test_get_by_name(self):
        entities = self.get("data/entities")
        self.assertEquals(len(entities), 5)
        entities = self.get("data/entities?name=%s" % entities[0]['name'])
        self.assertEquals(len(entities), 1)
        entities = self.get("data/entities?name=%s&project_id=%s" % (
            entities[0]['name'],
            self.project_id)
        )
        self.assertEquals(len(entities), 1)
        entities = self.get("data/entities?name=%s&project_id=%s" % (
            entities[0]['name'],
            self.project2_id)
        )
        self.assertEquals(len(entities), 0)
