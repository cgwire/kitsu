from tests.base import ApiDBTestCase


class OutputFileTestCase(ApiDBTestCase):

    def setUp(self):
        super(OutputFileTestCase, self).setUp()

        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_asset_type()
        self.generate_fixture_department()
        self.generate_fixture_task_type()
        self.generate_fixture_task_status()
        self.generate_fixture_asset()
        self.generate_fixture_episode()
        self.generate_fixture_sequence()
        self.generate_fixture_shot()
        self.generate_fixture_person()
        self.generate_fixture_assigner()
        self.generate_fixture_shot_task()

    def test_get_output_files(self):
        csv_projects = self.get_raw(
            "/export/csv/projects/%s/shots.csv" % self.project.id
        )
        expected_result = """Project,Episode,Sequence,Name,Description,Frame In,Frame Out,Animation\r
Cosmos Landromat,E01,S01,P01,Description Shot 01,0,100,opn\r\n"""
        self.assertEqual(csv_projects, expected_result)
