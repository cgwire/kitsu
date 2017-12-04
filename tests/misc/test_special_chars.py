# -*- coding: UTF-8 -*-
from tests.base import ApiDBTestCase


class SpecialCharTestCase(ApiDBTestCase):

    def setUp(self):
        super(SpecialCharTestCase, self).setUp()
        self.generate_fixture_project_status()
        self.generate_fixture_project()

    def test_repr(self):
        self.project.name = u"Battle 360°"
        self.project.save()
        self.assertEqual(self.project.name, u"Battle 360°")

    def test_get_special_char(self):
        self.project.name = u"Battle 360°"
        self.project.save()
        projects = self.get("data/projects")
        self.assertEqual(projects[0]["name"], u"Battle 360°")
