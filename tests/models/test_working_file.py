from tests.base import ApiDBTestCase

from zou.app.models.working_file import WorkingFile

from zou.app.utils import fields
from zou.app.services import projects_service


class WorkingFileTestCase(ApiDBTestCase):

    def setUp(self):
        super(WorkingFileTestCase, self).setUp()
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
        self.generate_data(
            WorkingFile,
            3,
            task_id=self.task.id,
            entity_id=self.asset.id,
            person_id=self.person.id,
            outputs=[]
        )

    def test_get_working_files(self):
        working_files = self.get("data/working-files")
        self.assertEquals(len(working_files), 3)

    def test_get_working_file(self):
        self.generate_fixture_user_cg_artist()
        user_cg_artist_id = self.user_cg_artist["id"]
        working_file = self.get_first("data/working-files")
        working_file_again = self.get(
            "data/working-files/%s" % working_file["id"])
        self.assertEquals(working_file, working_file_again)
        self.get_404("data/working-files/%s" % fields.gen_uuid())

        self.log_in_cg_artist()
        working_file_again = self.get(
            "data/working-files/%s" % working_file["id"], 403)
        projects_service.add_team_member(self.project_id, user_cg_artist_id)
        working_file_again = self.get(
            "data/working-files/%s" % working_file["id"])

    def test_create_working_file(self):
        data = {
            "name": "Modeling working_file 1",
            "revision": 2,
            "comment": "Test comment",
            "size": 1024,
            "task_id": self.task.id,
            "entity_id": self.asset.id,
            "person_id": self.person.id
        }
        self.working_file = self.post("data/working-files", data)
        self.assertIsNotNone(self.working_file["id"])

        working_files = self.get("data/working-files")
        self.assertEquals(len(working_files), 4)

    def test_update_working_file(self):
        working_file = self.get_first("data/working-files")
        data = {
            "name": "Super modeling working_file 2"
        }
        self.put("data/working-files/%s" % working_file["id"], data)
        working_file_again = self.get(
            "data/working-files/%s" % working_file["id"])
        self.assertEquals(data["name"], working_file_again["name"])
        self.put_404("data/working-files/%s" % fields.gen_uuid(), data)

    def test_delete_working_file(self):
        working_files = self.get("data/working-files")
        self.assertEquals(len(working_files), 3)
        working_file = working_files[0]
        self.delete("data/working-files/%s" % working_file["id"])
        working_files = self.get("data/working-files")
        self.assertEquals(len(working_files), 2)
        self.delete_404("data/working-files/%s" % fields.gen_uuid())

    def test_serialize_outputs(self):
        self.generate_fixture_software()
        working_file = self.generate_fixture_working_file()
        self.generate_fixture_file_status()
        self.generate_fixture_output_type()
        output_file = self.generate_fixture_output_file()
        output_file.source_file_id = working_file.id
        output_file.save()
        self.assertEquals(
            working_file.serialize()["outputs"],
            [str(output_file.id)]
        )
