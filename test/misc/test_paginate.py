from test.base import ApiDBTestCase

from zou.app.models.person import Person


class PaginationTestCase(ApiDBTestCase):

    def setUp(self):
        super(PaginationTestCase, self).setUp()
        self.generate_data(Person, 250)

    def test_paginate(self):
        persons = self.get("data/persons?page=1")["data"]
        self.assertEquals(len(persons), 100)
        persons = self.get("data/persons?page=2")["data"]
        self.assertEquals(len(persons), 100)
        persons = self.get("data/persons?page=3")["data"]
        self.assertEquals(len(persons), 51)

    def test_404(self):
        self.get("data/persons?page=4", 404)
        self.get("data/persons?page=0", 404)

    def test_metadata(self):
        pagination_infos = self.get("data/persons?page=2")
        self.assertEquals(pagination_infos["total"], 251)
        self.assertEquals(pagination_infos["nb_pages"], 3)
        self.assertEquals(pagination_infos["page"], 2)
        self.assertEquals(pagination_infos["offset"], 100)
        self.assertEquals(pagination_infos["limit"], 100)
