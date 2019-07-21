from tests.base import ApiDBTestCase

from zou.app.models.person import Person


class PaginationTestCase(ApiDBTestCase):

    def setUp(self):
        super(PaginationTestCase, self).setUp()
        self.generate_data(Person, 250, skills=[])

    def test_paginate(self):
        persons = self.get("data/persons?page=1")["data"]
        self.assertEqual(len(persons), 100)
        persons = self.get("data/persons?page=2")["data"]
        self.assertEqual(len(persons), 100)
        persons = self.get("data/persons?page=3")["data"]
        self.assertEqual(len(persons), 51)

    def test_404(self):
        persons = self.get("data/persons?page=4")["data"]
        self.assertEqual(len(persons), 0)
        persons = self.get("data/persons?page=0")["data"]
        self.assertEqual(len(persons), 0)

    def test_metadata(self):
        pagination_infos = self.get("data/persons?page=2")
        self.assertEqual(pagination_infos["total"], 251)
        self.assertEqual(pagination_infos["nb_pages"], 3)
        self.assertEqual(pagination_infos["page"], 2)
        self.assertEqual(pagination_infos["offset"], 100)
        self.assertEqual(pagination_infos["limit"], 100)
