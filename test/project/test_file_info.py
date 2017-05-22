from test.base import ApiDBTestCase

from zou.app import app
from zou.app.project import file_info
from zou.app.project.exception import (
    WorkingFileNotFoundException,
    OutputFileNotFoundException
)


class FileInfoTestCase(ApiDBTestCase):

    def setUp(self):
        super(FileInfoTestCase, self).setUp()

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
        self.generate_fixture_task_status_to_review()
        self.generate_fixture_person()
        self.generate_fixture_assigner()
        self.generate_fixture_task()
        self.generate_fixture_file_status()
        self.generate_fixture_working_file()
        self.generate_fixture_output_file()

    def test_get_default_status(self):
        file_status = file_info.get_default_status()
        self.assertEqual(file_status.name, app.config["DEFAULT_FILE_STATUS"])

    def test_get_working_file(self):
        working_file = file_info.get_working_file(self.working_file.id)
        self.assertEqual(working_file.id, self.working_file.id)
        self.assertRaises(
            WorkingFileNotFoundException,
            file_info.get_working_file,
            "unknown"
        )

    def test_get_output_file(self):
        output_file = file_info.get_output_file(self.output_file.id)
        self.assertEqual(output_file.id, self.output_file.id)
        self.assertRaises(
            OutputFileNotFoundException,
            file_info.get_output_file,
            "unknown"
        )

    def test_create_new_working_revision(self):
        self.working_file.delete()
        working_file = file_info.create_new_working_revision(
            self.entity.id,
            self.task.id,
            self.person.id,
            "comment"
        )
        self.assertEqual(working_file.revision, 1)
        working_file = file_info.create_new_working_revision(
            self.entity.id,
            self.task.id,
            self.person.id,
            "comment"
        )
        self.assertEqual(working_file.revision, 2)

    def test_create_new_output_revision(self):
        self.output_file.delete()
        output_file = file_info.create_new_output_revision(
            self.entity.id,
            self.task.id,
            self.person.id,
            "comment"
        )
        self.assertEqual(output_file.revision, 1)
        output_file = file_info.create_new_output_revision(
            self.entity.id,
            self.task.id,
            self.person.id,
            "comment"
        )
        self.assertEqual(output_file.revision, 2)

    def test_get_next_output_revision_number(self):
        revision = file_info.get_next_output_revision_number(self.task)

        self.assertEqual(revision, 2)

    def test_get_last_output_revision(self):
        output_file = file_info.create_new_output_revision(
            self.entity.id,
            self.task.id,
            self.person.id,
            "comment"
        )
        output_file = file_info.create_new_output_revision(
            self.entity.id,
            self.task.id,
            self.person.id,
            "comment"
        )

        output_file = file_info.get_last_output_revision(
            self.task.id,
            self.entity.id
        )
        self.assertEqual(output_file.revision, 3)
