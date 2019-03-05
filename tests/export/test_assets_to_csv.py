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
        expected_result = """Project;Type;Name;Description;Time Spent;Shaders\r
Cosmos Landromat;Props;Tree;Description Tree;0.10;opn\r\n"""
        self.assertEqual(csv_assets, expected_result)

    def test_get_asset_csv_with_metadata(self):
        self.generate_fixture_metadata_descriptor()
        self.asset.update({
            "data": {
                "contractor": "Contractor 1"
            }
        })
        csv_assets = self.get_raw(
            "/export/csv/projects/%s/assets.csv" % self.project.id
        )
        expected_result = """Project;Type;Name;Description;Time Spent;Contractor;Shaders\r
Cosmos Landromat;Props;Tree;Description Tree;0.10;Contractor 1;opn\r\n"""
        self.assertEqual(csv_assets, expected_result)
