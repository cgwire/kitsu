import os

from test.base import ApiDBTestCase

from zou.app.models.entity_type import EntityType
from zou.app.project import shot_info


class ImportCsvShotsTestCase(ApiDBTestCase):

    def setUp(self):
        super(ImportCsvShotsTestCase, self).setUp()

        self.generate_fixture_project_status()
        self.generate_fixture_project()

    def test_import_shots(self):
        path = "/data/import/csv/shots"

        file_path_fixture = self.get_fixture_file_path(
            os.path.join("csv", "shots.csv")
        )
        self.upload_file(path, file_path_fixture)

        sequences = shot_info.get_sequences()
        self.assertEqual(len(sequences), 2)
        shots = shot_info.get_shots()
        self.assertEqual(len(shots), 3)

        entity_types = EntityType.query.all()
        self.assertEqual(len(entity_types), 3)
