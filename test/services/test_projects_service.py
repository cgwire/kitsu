from test.base import ApiDBTestCase

from zou.app.models.project_status import ProjectStatus
from zou.app.services import projects_service
from zou.app.services.exception import ProjectNotFoundException


class ProjectServiceTestCase(ApiDBTestCase):

    def setUp(self):
        super(ProjectServiceTestCase, self).setUp()

        self.generate_fixture_project_status()
        self.generate_fixture_project_closed_status()
        self.generate_fixture_project()
        self.generate_fixture_project_closed()

    def test_get_open_projects(self):
        projects = projects_service.open_projects()
        self.assertEqual(len(projects), 1)
        self.assertEqual("Cosmos Landromat", projects[0]["name"])

    def test_get_all_projects(self):
        projects = projects_service.all_projects()
        self.assertEqual(len(projects), 2)
        self.assertEqual(projects[0]["project_status_name"], "open")

    def test_get_or_create_status(self):
        project_status = projects_service.get_or_create_status("Frozen")
        statuses = ProjectStatus.query.all()
        self.assertEqual(project_status["name"], "Frozen")
        self.assertEqual(len(statuses), 3)

        project_status = projects_service.get_or_create_status("Frozen")
        self.assertEqual(project_status["name"], "Frozen")
        self.assertEqual(len(statuses), 3)

    def test_get_or_create_open_status(self):
        project_status = projects_service.get_or_create_open_status()
        self.assertEqual(project_status["name"], "Open")

    def test_save_project_status(self):
        statuses = projects_service.save_project_status(["Frozen", "Postponed"])
        self.assertEqual(len(statuses), 2)
        statuses = ProjectStatus.query.all()
        self.assertEqual(len(statuses), 4)

        statuses = projects_service.save_project_status(["Frozen", "Postponed"])
        self.assertEqual(len(statuses), 2)
        statuses = ProjectStatus.query.all()
        self.assertEqual(len(statuses), 4)

    def test_get_or_create(self):
        project = projects_service.get_or_create("Agent 327")
        projects = projects_service.all_projects()
        self.assertIsNotNone(project["id"])
        self.assertEqual(project["name"], "Agent 327")
        self.assertEqual(len(projects), 3)

    def test_get_project_by_name(self):
        project = projects_service.get_project_by_name(self.project.name)
        self.assertEqual(project["name"], self.project.name)
        self.assertRaises(
            ProjectNotFoundException,
            projects_service.get_project_by_name,
            "missing"
        )

    def test_get_project(self):
        project = projects_service.get_project(self.project.id)
        self.assertEqual(project["name"], self.project.name)
        self.assertRaises(
            ProjectNotFoundException,
            projects_service.get_project,
            "wrongid"
        )
