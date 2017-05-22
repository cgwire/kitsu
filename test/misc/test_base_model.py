# -*- coding: UTF-8 -*-
from test.base import ApiDBTestCase


class BaseModelTestCase(ApiDBTestCase):

    def test_repr(self):
        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.assertEqual(str(self.project), "<Project Cosmos Landromat>")
        self.project.name = u"Big Buck Bunny"
        self.assertEqual(str(self.project), "<Project Big Buck Bunny>")

    def test_query(self):
        pass

    def test_get(self):
        pass

    def test_get_by(self):
        pass

    def test_get_all_by(self):
        pass

    def test_create(self):
        pass

    def test_get_id_map(self):
        pass

    def save(self):
        pass

    def delete(self):
        pass

    def update(self):
        pass
