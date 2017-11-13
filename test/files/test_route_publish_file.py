from test.base import ApiDBTestCase

from zou.app.utils import events

from zou.app.services import files_service, tasks_service


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
        self.generate_fixture_software()
        self.generate_fixture_working_file()
        self.generate_fixture_shot_working_file()
        self.task_id = str(self.task.id)
        self.tx_type_id = str(
            files_service.get_or_create_output_type("tx")["id"]
        )
        self.cache_type_id = str(
            files_service.get_or_create_output_type("Cache")["id"]
        )
        self.person_id = str(self.person.id)
        self.working_file_id = str(self.working_file.id)

        events.unregister_all()

    def new_output(self, data, code=201):
        return self.post(
            "data/tasks/%s/working-files/%s/output-files/new" % (
                self.task_id,
                self.working_file_id
            ),
            data,
            code
        )

    def test_to_review(self):
        data = {"person_id": str(self.person_id)}
        status_id = str(tasks_service.get_to_review_status()["id"])
        self.put("/actions/tasks/%s/to-review" % self.task_id, data)
        task = self.get("data/tasks/%s" % self.task_id)
        self.assertEquals(task["task_status_id"], status_id)

    def test_new_output(self):
        data = {
            "person_id": self.person_id,
            "comment": "test working file publish",
            "output_type_id": self.tx_type_id
        }
        result = self.new_output(data)

        self.assertEqual(
            result["folder_path"],
            "/simple/productions/export/cosmos_landromat/assets/props/tree/"
            "shaders/tx"
        )
        self.assertEqual(
            result["file_name"],
            "cosmos_landromat_props_tree_shaders_tx_main_v001"
        )

        output_file_id = result["id"]
        output_file = self.get("/data/output-files/%s" % output_file_id)

        self.assertEqual(output_file["comment"], data["comment"])
        self.assertEqual(output_file["revision"], 1)
        self.assertEqual(output_file["source_file_id"], self.working_file_id)

    def test_new_output_again(self):
        data = {
            "person_id": self.person_id,
            "comment": "test working file publish",
            "output_type_id": self.tx_type_id
        }
        result = self.new_output(data)
        result = self.new_output(data)

        self.assertEqual(
            result["folder_path"],
            "/simple/productions/export/cosmos_landromat/assets/props/tree/"
            "shaders/tx"
        )
        self.assertEqual(
            result["file_name"],
            "cosmos_landromat_props_tree_shaders_tx_main_v002"
        )

        output_file_id = result["id"]
        output_file = self.get("/data/output-files/%s" % output_file_id)

        self.assertEqual(output_file["comment"], data["comment"])
        self.assertEqual(output_file["revision"], 2)
        self.assertEqual(output_file["source_file_id"], self.working_file_id)

    def test_new_output_revision_forced(self):
        data = {
            "person_id": self.person_id,
            "comment": "test working file publish",
            "output_type_id": self.tx_type_id,
            "revision": 66
        }
        result = self.new_output(data)

        self.assertEqual(
            result["file_name"],
            "cosmos_landromat_props_tree_shaders_tx_main_v066"
        )

        output_file_id = result["id"]
        output_file = self.get("/data/output-files/%s" % output_file_id)
        self.assertEqual(output_file["revision"], 66)

    def test_new_output_wrong_data(self):
        data = {
            "comment_wrong": "test file publish"
        }
        self.new_output(data, 400)
