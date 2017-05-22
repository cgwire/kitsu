from test.base import ApiDBTestCase


class GetTaskFromPathTestCase(ApiDBTestCase):

    def setUp(self):
        super(GetTaskFromPathTestCase, self).setUp()

        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_person()
        self.generate_fixture_assigner()
        self.generate_fixture_project_standard()
        self.generate_fixture_entity_type()
        self.generate_fixture_entity()
        self.generate_fixture_entity_standard()
        self.generate_fixture_sequence()
        self.generate_fixture_shot()
        self.generate_fixture_department()
        self.generate_fixture_task_type()
        self.generate_fixture_task_status()
        self.generate_fixture_shot_task()
        self.generate_fixture_task_standard()
        self.generate_fixture_task()

    def test_get_shot_task_from_path(self):
        data = {
            "file_path": "/simple/productions/the_crew/shots/s01/p01/animation",
            "project_id": self.project.id,
            "type": "shot"
        }
        result = self.post("project/tasks/from-path", data, 200)
        self.assertEquals(
            result["id"], str(self.shot_task.id)
        )

    def test_get_asset_task_from_path(self):
        path = "/simple/productions/the_crew/assets/props/tree/shaders"
        data = {
            "file_path": path,
            "project_id": self.project.id,
            "type": "asset"
        }
        result = self.post("project/tasks/from-path", data, 200)
        self.assertEquals(
            result["id"], str(self.task.id)
        )

    def test_get_task_from_path_wrong_data(self):
        data = {
            "name": "/simple/productions/the_crew/shots/s01/p01/shaders",
        }
        self.post("project/tasks/from-path", data, 400)
