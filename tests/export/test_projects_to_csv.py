from tests.base import ApiDBTestCase


class OutputFileTestCase(ApiDBTestCase):

    def setUp(self):
        super(OutputFileTestCase, self).setUp()

        self.generate_fixture_project_status()
        self.generate_fixture_project()

    def test_get_output_files(self):
        csv_projects = self.get_raw("/export/csv/projects.csv")
        expected_result = """Name;Status\r
Cosmos Landromat;Open\r\n"""
        self.assertEqual(csv_projects, expected_result)
