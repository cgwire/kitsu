from tests.base import ApiDBTestCase


class TasksCsvExportTestCase(ApiDBTestCase):

    def setUp(self):
        super(TasksCsvExportTestCase, self).setUp()

        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_asset_type()
        self.generate_fixture_department()
        self.generate_fixture_task_type()
        self.generate_fixture_task_status()
        self.generate_fixture_asset()
        self.generate_fixture_sequence()
        self.generate_fixture_shot()
        self.generate_fixture_person()
        self.generate_fixture_assigner()
        self.generate_fixture_task()

    def test_get_output_files(self):
        csv_tasks = self.get_raw("/export/csv/tasks.csv")
        expected_result = """Project;Department;Task Type;Entity Type;Entity;Assigner;Assignees;Duration;Estimation;Start date;Real start date;Due date;Task Status\r
Cosmos Landromat;Modeling;Shaders;Props;Tree;Ema Peel;John Doe;50;40;2017-02-20;2017-02-22;2017-02-28;Open\r
"""
        self.assertEqual(csv_tasks, expected_result)
