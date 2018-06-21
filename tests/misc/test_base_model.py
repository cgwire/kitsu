# -*- coding: UTF-8 -*-
from tests.base import ApiDBTestCase

from zou.app.models.project import Project


class BaseModelTestCase(ApiDBTestCase):

    def test_get(self):
        self.generate_fixture_project_status()
        project_id = self.generate_fixture_project().id
        project = Project.get(project_id)
        self.assertEqual(project.id, project_id)

    def test_get_by(self):
        self.generate_fixture_project_status()
        self.generate_fixture_project()
        project_id = self.generate_fixture_project("Second project").id
        project = Project.get_by(name="Second project")
        self.assertEqual(project.id, project_id)

    def test_get_all_by(self):
        self.generate_fixture_project_status()
        self.generate_fixture_project()
        project_id = self.generate_fixture_project("Second project").id
        projects = Project.get_all_by(name="Second project")
        self.assertEqual(len(projects), 1)

        project = projects[0]
        self.assertEqual(project.id, project_id)

    def test_create(self):
        self.generate_fixture_project_status()
        self.generate_fixture_project()
        project_id = self.generate_fixture_project("Second project").id
        projects = Project.get_all_by(name="Second project")
        self.assertEqual(len(projects), 1)

        project = projects[0]
        self.assertEqual(project.id, project_id)

    def test_get_id_map(self):
        self.generate_fixture_project_status()
        self.generate_fixture_project()
        project_id = self.generate_fixture_project("Second project").id
        project_map = Project.get_id_map(field="name")
        self.assertTrue("Second project" in project_map)
        project_id_again = project_map["Second project"]
        self.assertEqual(project_id_again, project_id)

    def save(self):
        self.generate_fixture_project_status()
        project = self.generate_fixture_project()
        project.name = "new name"
        project.save()
        project = Project.get(project.id)
        self.assertEqual(project.name, "new name")

    def delete(self):
        self.generate_fixture_project_status()
        project = self.generate_fixture_project()
        project.delete()
        project = Project.get(project.id)
        self.assertIsNone(project)

    def update(self):
        self.generate_fixture_project_status()
        project = self.generate_fixture_project()
        project.update({
            "name": "new name"
        })
        project = Project.get(project.id)
        self.assertEqual(project.name, "new name")
