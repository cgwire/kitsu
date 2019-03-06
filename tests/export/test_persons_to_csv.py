from tests.base import ApiDBTestCase


class PersonsCsvExportTestCase(ApiDBTestCase):

    def setUp(self):
        super(PersonsCsvExportTestCase, self).setUp()

        self.generate_fixture_person()

    def test_get_asset_csv(self):
        csv_persons = self.get_raw("/export/csv/persons.csv")
        expected_result = """Last Name;First Name;Email;Phone;Role\r
Did;John;john.did@gmail.com;;admin\r
Doe;John;john.doe@gmail.com;;user\r\n"""
        self.assertEqual(csv_persons, expected_result)
