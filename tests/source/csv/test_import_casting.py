from tests.base import ApiDBTestCase


class ImportCsvCastingTestCase(ApiDBTestCase):

    def setUp(self):
        super(ImportCsvCastingTestCase, self).setUp()
        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_asset_type()
        self.generate_fixture_asset_types()

    def test_import_casting(self):
        for (name, asset_type_id) in [
            ("Lake", self.asset_type_environment.id),
            ("Mine", self.asset_type_environment.id),
            ("Boat", self.asset_type_props.id),
            ("Pool", self.asset_type_props.id),
            ("Flowers", self.asset_type_props.id),
            ("Block", self.asset_type_props.id),
            ("Wagon", self.asset_type_props.id),
            ("Victor", self.asset_type_character.id),
            ("John", self.asset_type_character.id)
        ]:
            self.generate_fixture_asset(name, asset_type_id=asset_type_id)
            if name == "Lake":
                self.asset_lake_id = self.asset.id
            if name == "Mine":
                self.asset_mine_id = self.asset.id

        self.generate_fixture_episode("E01")
        self.generate_fixture_sequence("SEQ01")
        e01seq01sh01_id = self.generate_fixture_shot("SH01").id
        e01seq01sh02_id = self.generate_fixture_shot("SH02").id
        self.generate_fixture_sequence("SEQ02")
        e01seq02sh01_id = self.generate_fixture_shot("SH01").id
        self.generate_fixture_episode("E02")
        self.generate_fixture_sequence("SEQ01")
        e02seq01sh01_id = self.generate_fixture_shot("SH01").id

        path = "/import/csv/projects/%s/casting" % self.project.id
        self.upload_csv(path, "casting")

        assets = self.get("data/shots/%s/assets" % e01seq01sh01_id)
        self.assertEqual(len(assets), 2)
        self.assertTrue("Victor" in [assets[0]["name"], assets[1]["name"]])

        assets = self.get("data/shots/%s/assets" % e01seq01sh02_id)
        self.assertEqual(len(assets), 2)

        assets = self.get("data/shots/%s/assets" % e01seq02sh01_id)
        self.assertEqual(len(assets), 1)

        assets = self.get("data/shots/%s/assets" % e02seq01sh01_id)
        self.assertEqual(len(assets), 2)

        assets = self.get("data/assets/%s/assets" % self.asset_lake_id)
        self.assertEqual(len(assets), 3)
        self.assertTrue(
            "Boat" in [assets[0]["name"], assets[1]["name"], assets[2]["name"]]
        )

        assets = self.get("data/assets/%s/assets" % self.asset_mine_id)
        self.assertEqual(len(assets), 2)
        self.assertTrue("Wagon" in [assets[0]["name"], assets[1]["name"]])
