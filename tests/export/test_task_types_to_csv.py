from tests.base import ApiDBTestCase


class TasksCsvExportTestCase(ApiDBTestCase):

    def setUp(self):
        super(TasksCsvExportTestCase, self).setUp()

        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_asset_type()
        self.generate_fixture_department()
        self.generate_fixture_task_type()

    def test_get_output_files(self):
        csv_task_types = self.get_raw("export/csv/task-types.csv")
        expected_result = """Department;Name\r
Animation;Animation\r
Modeling;Shaders\r
"""
        self.assertEqual(csv_task_types, expected_result)
