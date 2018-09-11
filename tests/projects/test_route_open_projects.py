from tests.base import ApiDBTestCase

from zou.app.services import projects_service


class OpenProjectRouteTestCase(ApiDBTestCase):

    def setUp(self):
        super(OpenProjectRouteTestCase, self).setUp()

        self.generate_fixture_project_status()
        self.generate_fixture_project_closed_status()
        self.generate_fixture_project()
        self.generate_fixture_project_closed()

    def test_open_projects(self):
        projects = self.get("data/projects/open/")

        self.assertEqual(len(projects), 1)
        self.assertEqual(projects[0]["name"], self.project.name)

    def test_add_team_member(self):
        self.generate_fixture_person()
        self.post("data/projects/%s/team" % self.project.id, {
            "person_id": self.person.id
        })
        project = projects_service.get_project(self.project.id)
        self.assertEqual(project["team"], [str(self.person.id)])

    def test_remove_team_member(self):
        self.generate_fixture_person()
        projects_service.add_team_member(self.project.id, self.person.id)
        self.delete("data/projects/%s/team/%s" % (self.project.id, self.person.id))
        project = projects_service.get_project(self.project.id)
        self.assertEqual(project["team"], [])
