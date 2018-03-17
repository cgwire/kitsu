from tests.base import ApiDBTestCase


class AssetsCsvExportTestCase(ApiDBTestCase):

    def setUp(self):
        super(AssetsCsvExportTestCase, self).setUp()

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

    def test_get_asset_csv(self):
        csv_assets = self.get_raw(
            "/export/csv/projects/%s/assets.csv" % self.project.id
        )
        expected_result = """Project,Type,Name,Description,Shaders\r
Cosmos Landromat,Props,Tree,Description Tree,opn\r\n"""
        self.assertEqual(csv_assets, expected_result)
