import os

from tests.base import ApiDBTestCase

from zou.app.models.person import Person


class ImportCsvPersonsTestCase(ApiDBTestCase):

    def setUp(self):
        super(ImportCsvPersonsTestCase, self).setUp()

    def tearDown(self):
        super(ImportCsvPersonsTestCase, self).tearDown()

    def test_import_persons(self):
        path = "/import/csv/persons"

        file_path_fixture = self.get_fixture_file_path(
            os.path.join("csv", "persons.csv")
        )
        self.upload_file(path, file_path_fixture)

        persons = Person.query.all()
        self.assertEqual(len(persons), 3)
