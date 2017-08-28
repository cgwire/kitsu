# -*- coding: UTF-8 -*-
from test.base import ApiDBTestCase
from zou.app.models.person import Person

from zou.app.utils import fields


class PersonTestCase(ApiDBTestCase):

    def setUp(self):
        super(PersonTestCase, self).setUp()
        self.generate_data(Person, 3, skills=[])

    def test_repr(self):
        self.generate_fixture_person()
        self.assertEqual(str(self.person), "<Person John Doe>")
        self.person.first_name = u"Léon"
        self.assertEqual(str(self.person), "<Person Léon Doe>")

    def test_get_persons(self):
        persons = self.get("data/persons")
        self.assertEquals(len(persons), 4)
        self.assertEquals(persons[0]["type"], "Person")

    def test_get_person(self):
        person = self.get_first("data/persons")
        person_again = self.get("data/persons/%s" % person["id"])
        self.assertEquals(person, person_again)
        self.get_404("data/persons/%s" % fields.gen_uuid())

    def test_create_person(self):
        data = {
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@gmail.com"
        }
        self.person = self.post("data/persons", data)
        self.assertIsNotNone(self.person["id"])

        persons = self.get("data/persons")
        self.assertEquals(len(persons), 5)

    def test_create_person_with_no_data(self):
        data = {}
        self.person = self.post("data/persons", data, 400)

    def test_create_person_with_wrong_data(self):
        data = {
            "name": "John Doe",
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@gmail.com"
        }
        self.person = self.post("data/persons", data, 400)

    def test_create_person_with_wrong_data_2(self):
        data = {
            "id": 1,
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@gmail.com"
        }
        self.person = self.post("data/persons", data, 400)

    def test_update_person(self):
        person = self.get_first("data/persons")
        data = {
            "first_name": "Johnny",
        }
        self.put("data/persons/%s" % person["id"], data)
        person_again = self.get("data/persons/%s" % person["id"])
        self.assertEquals(data["first_name"], person_again["first_name"])
        self.put_404("data/persons/%s" % fields.gen_uuid(), data)

    def test_delete_person(self):
        persons = self.get("data/persons")
        self.assertEquals(len(persons), 4)

        person = persons[1]
        self.delete("data/persons/%s" % person["id"])
        persons = self.get("data/persons")
        self.assertEquals(len(persons), 3)

        self.delete_404("data/persons/%s" % fields.gen_uuid())
        persons = self.get("data/persons")
        self.assertEquals(len(persons), 3)
