import os

from tests.base import ApiDBTestCase

from zou.app.models.entity import Entity
from zou.app.models.entity_type import EntityType


class ImportCsvAssetsTestCase(ApiDBTestCase):

    def setUp(self):
        super(ImportCsvAssetsTestCase, self).setUp()

        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_metadata_descriptor(entity_type="Shot")

    def test_import_assets(self):
        path = "/import/csv/projects/%s/assets" % self.project.id

        file_path_fixture = self.get_fixture_file_path(
            os.path.join("csv", "assets.csv")
        )
        self.upload_file(path, file_path_fixture)

        entities = Entity.query.all()
        self.assertEqual(len(entities), 3)

        entity_types = EntityType.query.all()
        self.assertEqual(len(entity_types), 2)

        asset = entities[0]
        self.assertEqual(asset.data.get("contractor", None), "contractor 1")

    def test_import_assets_duplicates(self):
        path = "/import/csv/projects/%s/assets" % self.project.id

        file_path_fixture = self.get_fixture_file_path(
            os.path.join("csv", "assets.csv")
        )
        self.upload_file(path, file_path_fixture)
        self.upload_file(path, file_path_fixture)

        entities = Entity.query.all()
        self.assertEqual(len(entities), 3)
