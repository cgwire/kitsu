from test.base import ApiDBTestCase

from zou.app.models.preview_file import PreviewFile

from zou.app.utils import fields


class PreviewFileTestCase(ApiDBTestCase):

    def setUp(self):
        super(PreviewFileTestCase, self).setUp()
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
        self.generate_fixture_file_status()
        self.generate_fixture_output_type()
        self.generate_fixture_output_file()
        self.generate_data(
            PreviewFile,
            3,
            task_id=self.task.id,
            person_id=self.person.id,
            source_file_id=self.output_file.id
        )

    def test_get_preview_files(self):
        preview_files = self.get("data/preview-files")
        self.assertEquals(len(preview_files), 3)

    def test_get_preview_file(self):
        preview_file = self.get_first("data/preview-files")
        preview_file_again = self.get(
            "data/preview-files/%s" % preview_file["id"])
        self.assertEquals(preview_file, preview_file_again)
        self.get_404("data/preview-files/%s" % fields.gen_uuid())

    def test_create_preview_file(self):
        data = {
            "name": "Modeling preview_file 1",
            "person_id": self.person.id,
            "task_id": self.task.id,
            "source_file_id": self.output_file.id
        }
        self.file_status_id = self.file_status.id
        self.preview_file = self.post("data/preview-files", data)
        self.assertIsNotNone(self.preview_file["id"])

        preview_files = self.get("data/preview-files")
        self.assertEquals(len(preview_files), 4)

    def test_update_preview_file(self):
        preview_file = self.get_first("data/preview-files")
        data = {
            "name": "Super modeling preview_file 2"
        }
        self.put("data/preview-files/%s" % preview_file["id"], data)
        preview_file_again = self.get(
            "data/preview-files/%s" % preview_file["id"])
        self.assertEquals(data["name"], preview_file_again["name"])
        self.put_404("data/preview-files/%s" % fields.gen_uuid(), data)

    def test_delete_preview_file(self):
        preview_files = self.get("data/preview-files")
        self.assertEquals(len(preview_files), 3)
        preview_file = preview_files[0]
        self.delete("data/preview-files/%s" % preview_file["id"])
        preview_files = self.get("data/preview-files")
        self.assertEquals(len(preview_files), 2)
        self.delete_404("data/preview-files/%s" % fields.gen_uuid())
