from test.base import ApiDBTestCase

from zou.app.models.working_file import WorkingFile

from zou.app.utils import fields


class WorkingFileTestCase(ApiDBTestCase):

    def setUp(self):
        super(WorkingFileTestCase, self).setUp()
        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_entity_type()
        self.generate_fixture_department()
        self.generate_fixture_task_type()
        self.generate_fixture_task_status()
        self.generate_fixture_entity()
        self.generate_fixture_sequence()
        self.generate_fixture_shot()
        self.generate_fixture_person()
        self.generate_fixture_assigner()
        self.generate_fixture_task()
        self.generate_data(
            WorkingFile,
            3,
            task_id=self.task.id,
            entity_id=self.entity.id,
            person_id=self.person.id
        )

    def test_get_working_files(self):
        working_files = self.get("data/working_files")
        self.assertEquals(len(working_files), 3)

    def test_get_working_file(self):
        working_file = self.get_first("data/working_files")
        working_file_again = self.get(
            "data/working_files/%s" % working_file["id"])
        self.assertEquals(working_file, working_file_again)
        self.get_404("data/working_files/%s" % fields.gen_uuid())

    def test_create_working_file(self):
        data = {
            "name": "Modeling working_file 1",
            "revision": 2,
            "comment": "Test comment",
            "size": 1024,
            "task_id": self.task.id,
            "entity_id": self.entity.id,
            "person_id": self.person.id
        }
        self.working_file = self.post("data/working_files", data)
        self.assertIsNotNone(self.working_file["id"])

        working_files = self.get("data/working_files")
        self.assertEquals(len(working_files), 4)

    def test_update_working_file(self):
        working_file = self.get_first("data/working_files")
        data = {
            "name": "Super modeling working_file 2"
        }
        self.put("data/working_files/%s" % working_file["id"], data)
        working_file_again = self.get(
            "data/working_files/%s" % working_file["id"])
        self.assertEquals(data["name"], working_file_again["name"])
        self.put_404("data/working_files/%s" % fields.gen_uuid(), data)

    def test_delete_working_file(self):
        working_files = self.get("data/working_files")
        self.assertEquals(len(working_files), 3)
        working_file = working_files[0]
        self.delete("data/working_files/%s" % working_file["id"])
        working_files = self.get("data/working_files")
        self.assertEquals(len(working_files), 2)
        self.delete_404("data/working_files/%s" % fields.gen_uuid())
