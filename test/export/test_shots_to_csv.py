from test.base import ApiDBTestCase


class OutputFileTestCase(ApiDBTestCase):

    def setUp(self):
        super(OutputFileTestCase, self).setUp()

        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_entity_type()
        self.generate_fixture_department()
        self.generate_fixture_task_type()
        self.generate_fixture_task_status()
        self.generate_fixture_entity()
        self.generate_fixture_sequence()
        self.generate_fixture_shot()
        self.generate_fixture_person()
        self.generate_fixture_assigner()
        self.generate_fixture_task()

    def test_get_output_files(self):
        csv_projects = self.get_raw("export/csv/shots.csv")
        expected_result = """Project,Sequence,Name,Description,FPS,Frame In,Frame Out\r
Cosmos Landromat,S01,P01,Description Shot 01,25,0,100\r\n"""
        self.assertEqual(csv_projects, expected_result)
