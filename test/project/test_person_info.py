from test.base import ApiDBTestCase

from zou.app.project import person_info

from zou.app.project.exception import PersonNotFoundException


class PersonInfoTestCase(ApiDBTestCase):

    def setUp(self):
        super(PersonInfoTestCase, self).setUp()

        self.generate_fixture_person()
        self.person_id = self.person.id
        self.person_email = self.person.email

    def test_get_person(self):
        self.assertRaises(
            PersonNotFoundException,
            person_info.get_person,
            "wrong-id"
        )
        person = person_info.get_person(self.person_id)
        self.assertEqual(self.person_id, person.id)
        person.delete()

        self.assertRaises(
            PersonNotFoundException,
            person_info.get_person,
            self.person_id
        )

    def test_get_by_email(self):
        self.assertRaises(
            PersonNotFoundException,
            person_info.get_by_email,
            "wrong-email"
        )
        person = person_info.get_by_email(self.person_email)
        self.assertEqual(self.person_id, person.id)
        person.delete()

        self.assertRaises(
            PersonNotFoundException,
            person_info.get_by_email,
            self.person_email
        )
