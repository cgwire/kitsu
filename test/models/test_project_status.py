from test.base import ApiDBTestCase
from zou.app.models.project_status import ProjectStatus

from zou.app.utils import fields


class ProjectStatusTestCase(ApiDBTestCase):

    def setUp(self):
        super(ProjectStatusTestCase, self).setUp()
        self.generate_data(ProjectStatus, 3)

    def test_get_project_statuss(self):
        project_statuss = self.get("data/project_status")
        self.assertEquals(len(project_statuss), 3)

    def test_get_project_status(self):
        project_status = self.get_first("data/project_status")
        project_status_again = self.get(
            "data/project_status/%s" % project_status["id"])
        self.assertEquals(project_status, project_status_again)
        self.get_404("data/project_status/%s" % fields.gen_uuid())

    def test_create_project_status(self):
        data = {
            "name": "open",
            "color": "#000000"
        }
        self.project_status = self.post("data/project_status", data)
        self.assertIsNotNone(self.project_status["id"])

        project_statuss = self.get("data/project_status")
        self.assertEquals(len(project_statuss), 4)

    def test_update_project_status(self):
        project_status = self.get_first("data/project_status")
        data = {
            "color": "#FFFFFF"
        }
        self.put("data/project_status/%s" % project_status["id"], data)
        project_status_again = self.get(
            "data/project_status/%s" % project_status["id"])
        self.assertEquals(data["color"], project_status_again["color"])
        self.put_404("data/project_status/%s" % fields.gen_uuid(), data)

    def test_delete_project_status(self):
        project_statuss = self.get("data/project_status")
        self.assertEquals(len(project_statuss), 3)
        project_status = project_statuss[0]
        self.delete("data/project_status/%s" % project_status["id"])
        project_statuss = self.get("data/project_status")
        self.assertEquals(len(project_statuss), 2)
        self.delete_404("data/project_status/%s" % fields.gen_uuid())
