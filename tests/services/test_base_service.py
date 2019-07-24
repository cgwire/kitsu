import pytest

from tests.base import ApiDBTestCase

from zou.app.services import base_service
from zou.app.models.project import Project
from zou.app.services.exception import ProjectNotFoundException


class BaseServiceTestCase(ApiDBTestCase):

    def setUp(self):
        super(BaseServiceTestCase, self).setUp()

    def test_get_instance(self):
        project = Project.create(name="Test")
        project_again = base_service.get_instance(
            Project,
            project.id,
            ProjectNotFoundException
        )
        self.assertEqual(project.id, project_again.id)
        project.delete()
        with pytest.raises(ProjectNotFoundException):
            base_service.get_instance(
                Project,
                project.id,
                ProjectNotFoundException
            )

    def test_get_or_create_instance_by_name(self):
        self.assertIsNone(Project.get_by(name="Test"))
        project = \
            base_service.get_or_create_instance_by_name(Project, name="Test")
        self.assertIsNotNone(Project.get_by(name="Test"))
        project_again = \
            base_service.get_or_create_instance_by_name(Project, name="Test")
        self.assertEqual(project["id"], project_again["id"])

    def test_get_model_map_from_array(self):
        models = [
            {"id": "1", "name": "first"},
            {"id": "2", "name": "second"},
            {"id": "3", "name": "third"}
        ]
        model_map = base_service.get_model_map_from_array(models)
        self.assertEqual(model_map["1"]["name"], "first")
        self.assertEqual(model_map["2"]["name"], "second")
        self.assertEqual(model_map["3"]["name"], "third")
