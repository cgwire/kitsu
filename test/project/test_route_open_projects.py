from test.base import ApiDBTestCase


class OpenProjectRouteTestCase(ApiDBTestCase):

    def setUp(self):
        super(OpenProjectRouteTestCase, self).setUp()

        self.generate_fixture_project_status()
        self.generate_fixture_project_closed_status()
        self.generate_fixture_project()

    def test_open_projects(self):
        projects = self.get("data/projects/open/")

        self.assertEqual(len(projects), 1)
        self.assertEqual(projects[0]["name"], self.project.name)
