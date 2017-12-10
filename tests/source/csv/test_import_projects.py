import os

from tests.base import ApiDBTestCase

from zou.app.models.project import Project
from zou.app.models.project_status import ProjectStatus


class ImportCsvProjectsTestCase(ApiDBTestCase):

    def setUp(self):
        super(ImportCsvProjectsTestCase, self).setUp()

    def tearDown(self):
        super(ImportCsvProjectsTestCase, self).tearDown()

    def test_import_projects(self):
        path = "/import/csv/projects"

        file_path_fixture = self.get_fixture_file_path(
            os.path.join("csv", "projects.csv")
        )
        self.upload_file(path, file_path_fixture)

        projects = Project.query.all()
        self.assertEqual(len(projects), 3)

        project_statuses = ProjectStatus.query.all()
        self.assertEqual(len(project_statuses), 2)
