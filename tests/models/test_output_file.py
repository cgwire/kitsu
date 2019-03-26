from tests.base import ApiDBTestCase

from zou.app.models.output_file import OutputFile

from zou.app.utils import fields
from zou.app.services import projects_service


class OutputFileTestCase(ApiDBTestCase):

    def setUp(self):
        super(OutputFileTestCase, self).setUp()
        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_asset_type()
        self.generate_fixture_department()
        self.generate_fixture_task_type()
        self.generate_fixture_task_status()
        self.generate_fixture_asset()
        self.generate_fixture_sequence()
        self.generate_fixture_shot()
        self.generate_fixture_person()
        self.generate_fixture_assigner()
        self.generate_fixture_task()
        self.generate_fixture_file_status()
        self.generate_data(
            OutputFile,
            3,
            task_id=self.task.id,
            entity_id=self.asset.id,
            person_id=self.person.id,
            file_status_id=self.file_status.id
        )

    def test_get_output_files(self):
        output_files = self.get("data/output-files")
        self.assertEquals(len(output_files), 3)

    def test_get_output_file(self):
        output_file = self.get_first("data/output-files")
        output_file_again = self.get(
            "data/output-files/%s" % output_file["id"])
        self.assertEquals(output_file, output_file_again)
        self.get_404("data/output-files/%s" % fields.gen_uuid())

    def test_create_output_file(self):
        data = {
            "name": "Modeling output_file 1",
            "revision": 2,
            "comment": "Test comment",
            "size": 1024,
            "person_id": self.person.id,
            "file_status_id": self.file_status.id
        }
        self.file_status_id = self.file_status.id
        self.output_file = self.post("data/output-files", data)
        self.assertIsNotNone(self.output_file["id"])

        output_files = self.get("data/output-files")
        self.assertEquals(len(output_files), 4)

    def test_update_output_file(self):
        output_file = self.get_first("data/output-files")
        data = {
            "name": "Super modeling output_file 2"
        }
        self.put("data/output-files/%s" % output_file["id"], data)
        output_file_again = self.get(
            "data/output-files/%s" % output_file["id"])
        self.assertEquals(data["name"], output_file_again["name"])
        self.put_404("data/output-files/%s" % fields.gen_uuid(), data)

    def test_delete_output_file(self):
        output_files = self.get("data/output-files")
        self.assertEquals(len(output_files), 3)
        output_file = output_files[0]
        self.delete("data/output-files/%s" % output_file["id"])
        output_files = self.get("data/output-files")
        self.assertEquals(len(output_files), 2)
        self.delete_404("data/output-files/%s" % fields.gen_uuid())

    def test_get_output_file_permission(self):
        output_file_id = self.get_first("data/output-files")["id"]
        self.generate_fixture_user_cg_artist()
        cg_artist_id = self.user_cg_artist["id"]
        self.log_in_cg_artist()
        output_files = self.get("data/output-files")
        self.assertEquals(len(output_files), 0)
        self.get("data/output-files/%s" % output_file_id, 403)

        projects_service.add_team_member(self.project_id, cg_artist_id)
        self.get("data/output-files/%s" % output_file_id)
        output_files = self.get("data/output-files")
        self.assertEquals(len(output_files), 3)
