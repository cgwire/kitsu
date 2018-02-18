from tests.source.shotgun.base import ShotgunTestCase

from zou.app.config import DEFAULT_FILE_TREE
from zou.app.services import file_tree_service
from zou.app.models.project_status import ProjectStatus


class ImportShotgunProjectTestCase(ShotgunTestCase):

    def setUp(self):
        super(ImportShotgunProjectTestCase, self).setUp()

    def test_import_projects(self):
        self.projects = self.load_fixture('projects')
        self.assertEqual(len(self.projects), 2)

        self.projects = self.get("data/projects")
        self.assertEqual(len(self.projects), 2)

        self.project_status = self.get("data/project-status")
        self.project_status = [
            x for x in self.project_status if x["name"] == "Active"
        ]
        active_id = self.project_status[0]["id"]
        self.assertEqual(self.projects[0]["project_status_id"], active_id)

        tree = file_tree_service.get_tree_from_file(DEFAULT_FILE_TREE)
        self.assertDictEqual(self.projects[0]["file_tree"], tree)

    def test_import_projects_twice(self):
        self.projects = self.load_fixture('projects')
        self.projects = self.load_fixture('projects')
        self.assertEqual(len(self.projects), 2)

        self.projects = self.get("data/projects")
        self.assertEqual(len(self.projects), 2)

    def test_import_project(self):
        sg_project = {
            "id": 3,
            "name": "Elephant Dream",
            "sg_status": "Active",
            "type": "Project"
        }

        api_path = "/import/shotgun/projects"
        self.projects = self.post(api_path, [sg_project], 200)
        self.assertEqual(len(self.projects), 1)

        self.projects = self.get("data/projects")
        self.assertEqual(len(self.projects), 1)

        project = self.projects[0]
        project_status = ProjectStatus.get_by(name=sg_project["sg_status"])
        self.assertEqual(project["name"], sg_project["name"])
        self.assertEqual(project["shotgun_id"], sg_project["id"])
        self.assertEqual(project["project_status_id"], str(project_status.id))
