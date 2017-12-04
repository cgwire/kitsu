from tests.base import ApiDBTestCase


class OpenProjectRouteTestCase(ApiDBTestCase):

    def setUp(self):
        super(OpenProjectRouteTestCase, self).setUp()

        self.generate_fixture_project_status()
        self.generate_fixture_project_closed_status()
        self.generate_fixture_project()
        self.generate_fixture_project_closed()

    def test_open_projects(self):
        projects = self.get("data/projects/all/")

        self.assertEqual(len(projects), 2)
        self.assertEqual(projects[0]["name"], self.project.name)
        self.assertEqual(projects[0]["project_status_name"], "open")
        self.assertEqual(projects[1]["project_status_name"], "closed")
