from test.base import ApiDBTestCase

from zou.app.utils import events


class PublishFileTestCase(ApiDBTestCase):

    def setUp(self):
        super(PublishFileTestCase, self).setUp()

        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_entity_type()
        self.generate_fixture_entity()
        self.generate_fixture_sequence()
        self.generate_fixture_shot()
        self.generate_fixture_department()
        self.generate_fixture_task_type()
        self.generate_fixture_task_status()
        self.generate_fixture_task_status_wip()
        self.generate_fixture_person()
        self.generate_fixture_assigner()
        self.generate_fixture_task()
        self.generate_fixture_shot_task()
        self.generate_fixture_working_file()
        self.generate_fixture_shot_working_file()

        events.unregister_all()

    def test_publish(self):
        publish_data = {
            "task_id": self.task.id,
            "person_id": self.person.id,
            "comment": "test working file publish",
            "working_file_revision": 15
        }
        result = self.post(
            "project/files/working-files/publish",
            publish_data
        )

        self.assertEqual(
            result["output_file"]["folder_path"],
            "/simple/productions/export/cosmos_landromat/assets/props/tree/shaders"
        )
        self.assertEqual(
            result["output_file"]["file_name"],
            "cosmos_landromat_props_tree_shaders_v001_test_working_file_publish"
        )

        output_file_id = result["output_file"]["id"]
        output_file = self.get("data/output_files/%s" % output_file_id)

        self.assertEqual(output_file["comment"], publish_data["comment"])
        self.assertEqual(output_file["revision"], 1)

        self.assertEqual(
            result["working_file"]["folder_path"],
            "/simple/productions/cosmos_landromat/assets/props/tree/shaders"
        )
        self.assertEqual(
            result["working_file"]["file_name"],
            "cosmos_landromat_props_tree_shaders_v015_test_working_file_publish"
        )

        working_file_id = result["working_file"]["id"]
        working_file = self.get("data/working_files/%s" % working_file_id)

        self.assertEqual(working_file["revision"], 15)

        self.assertEqual(
            output_file["source_file_id"],
            working_file["id"]
        )

    def test_publish_wrong_data(self):
        publish_data = {
            "comment_wrong": "test file publish"
        }
        self.post(
            "project/files/working-files/publish",
            publish_data,
            400
        )

    def test_publish_new_revision(self):
        publish_data = {
            "task_id": self.task.id,
            "person_id": self.person.id,
            "comment": "test working file publish"
        }
        self.post("project/files/working-files/publish", publish_data)
        result = self.post(
            "project/files/working-files/publish",
            publish_data
        )
        working_file_id = result["working_file"]["id"]
        output_file_id = result["output_file"]["id"]

        working_file = self.get("data/working_files/%s" % working_file_id)
        self.assertEqual(working_file["revision"], 3)

        output_file = self.get("data/output_files/%s" % output_file_id)
        self.assertEqual(output_file["revision"], 2)
