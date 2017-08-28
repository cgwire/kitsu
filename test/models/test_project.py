from test.base import ApiDBTestCase

from zou.app.models.project import Project

from zou.app.utils import fields


class ProjectTestCase(ApiDBTestCase):

    def setUp(self):
        super(ProjectTestCase, self).setUp()
        self.generate_data(Project, 3)

    def test_get_projects(self):
        projects = self.get("data/projects")
        self.assertEquals(len(projects), 3)

    def test_get_project(self):
        project = self.get_first("data/projects")
        project_again = self.get("data/projects/%s" % project["id"])
        self.assertEquals(project, project_again)
        self.get_404("data/projects/%s" % fields.gen_uuid())

    def test_create_project(self):
        data = {
            "name": "Cosmos Landromat",
            "description": "Video game trailer."
        }
        self.project = self.post("data/projects", data)
        self.assertIsNotNone(self.project["id"])

        projects = self.get("data/projects")
        self.assertEquals(len(projects), 4)

    def test_update_project(self):
        project = self.get_first("data/projects")
        data = {
            "name": "Cosmos Landromat 2"
        }
        self.put("data/projects/%s" % project["id"], data)
        project_again = self.get("data/projects/%s" % project["id"])
        self.assertEquals(data["name"], project_again["name"])
        self.put_404("data/projects/%s" % fields.gen_uuid(), data)

    def test_delete_project(self):
        projects = self.get("data/projects")
        self.assertEquals(len(projects), 3)
        project = projects[0]
        self.delete("data/projects/%s" % project["id"])
        projects = self.get("data/projects")
        self.assertEquals(len(projects), 2)
        self.delete_404("data/projects/%s" % fields.gen_uuid())

    def test_project_status(self):
        data = {
            "name": "open",
            "color": "#FFFFFF"
        }
        self.open_status = self.post("data/project-status", data)
        data = {
            "name": "close",
            "color": "#000000"
        }
        self.close_status = self.post("data/project-status", data)
        data = {
            "name": "Cosmos Landromat",
            "description": "Video game trailer.",
            "project_status_id": self.open_status["id"]
        }
        self.project = self.post("data/projects", data)
        self.assertIsNotNone(self.project["id"])
        project_again = self.get("data/projects/%s" % self.project["id"])
        self.assertEquals(
            project_again['project_status_id'], self.open_status["id"])
