from test.base import ApiDBTestCase


class AssetsCsvExportTestCase(ApiDBTestCase):

    def setUp(self):
        super(AssetsCsvExportTestCase, self).setUp()

        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_entity_type()
        self.generate_fixture_department()
        self.generate_fixture_task_type()
        self.generate_fixture_task_status()
        self.generate_fixture_entity()
        self.generate_fixture_sequence()
        self.generate_fixture_shot()

    def test_get_asset_csv(self):
        csv_assets = self.get_raw("/export/csv/assets.csv")
        expected_result = """Project,Category,Name,Description\r
Cosmos Landromat,Props,Tree,Description Tree\r\n"""
        self.assertEqual(csv_assets, expected_result)
