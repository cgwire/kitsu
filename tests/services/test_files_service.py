import pytest

from tests.base import ApiDBTestCase

from zou.app import app
from zou.app.services import files_service
from zou.app.models.software import Software
from zou.app.services.exception import (
    WorkingFileNotFoundException,
    SoftwareNotFoundException,
    OutputFileNotFoundException,
    EntryAlreadyExistsException
)


class FileServiceTestCase(ApiDBTestCase):

    def setUp(self):
        super(FileServiceTestCase, self).setUp()

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
        self.generate_fixture_shot_task()
        self.generate_fixture_file_status()
        self.generate_fixture_software()
        self.generate_fixture_working_file()
        self.generate_fixture_output_type()
        self.generate_fixture_output_file()

    def test_get_default_status(self):
        file_status = files_service.get_default_status()
        self.assertEqual(file_status["name"], app.config["DEFAULT_FILE_STATUS"])

    def test_get_working_file(self):
        working_file = files_service.get_working_file(self.working_file.id)
        self.assertEqual(working_file["id"], str(self.working_file.id))
        self.assertRaises(
            WorkingFileNotFoundException,
            files_service.get_working_file,
            "unknown"
        )

    def test_get_output_file(self):
        output_file = files_service.get_output_file(self.output_file.id)
        self.assertEqual(output_file["id"], str(self.output_file.id))
        self.assertRaises(
            OutputFileNotFoundException,
            files_service.get_output_file,
            "unknown"
        )

    def test_get_software(self):
        software = files_service.get_software(self.software.id)
        self.assertEqual(software["id"], str(self.software.id))
        self.assertRaises(
            SoftwareNotFoundException,
            files_service.get_software,
            "unknown"
        )

    def test_get_or_create_software(self):
        self.assertIsNone(Software.get_by(name="Maya"))
        software = files_service.get_or_create_software("Maya", "may", ".ma")
        self.assertIsNotNone(Software.get_by(name="Maya"))
        software_again = files_service.get_or_create_software(
            "Maya", "may", ".ma"
        )
        self.assertEqual(software["id"], software_again["id"])

    def test_get_working_files_for_task(self):
        self.generate_fixture_working_file(name="main", revision=2)
        self.generate_fixture_working_file(name="main", revision=3)
        self.generate_fixture_working_file(name="main", revision=4)
        self.generate_fixture_working_file(name="main", revision=5)
        working_files = files_service.get_working_files_for_task(self.task.id)
        self.assertEquals(len(working_files), 5)
        self.assertEquals(working_files[0]["revision"], 5)

    def test_get_last_working_files_for_task(self):
        self.generate_fixture_working_file(name="main", revision=2)
        self.generate_fixture_working_file(name="main", revision=3)
        self.generate_fixture_working_file(name="main", revision=4)
        self.generate_fixture_working_file(name="main", revision=5)
        self.generate_fixture_working_file(name="hotfix", revision=1)
        self.generate_fixture_working_file(name="hotfix", revision=2)
        self.generate_fixture_working_file(name="hotfix", revision=3)
        working_files = files_service.get_last_working_files_for_task(
            self.task.id
        )
        self.assertEquals(working_files["main"]["revision"], 5)
        self.assertEquals(working_files["hotfix"]["revision"], 3)

    def get_next_working_revision(self):
        self.generate_fixture_working_file(name="main", revision=2)
        self.generate_fixture_working_file(name="main", revision=3)
        self.generate_fixture_working_file(name="main", revision=4)
        self.generate_fixture_working_file(name="main", revision=5)
        revision = files_service.get_next_working_revision(self.task.id, "main")
        self.assertEquals(revision)

    def test_create_new_working_revision(self):
        self.working_file.delete()
        working_file = files_service.create_new_working_revision(
            self.task.id,
            self.person.id,
            self.software.id,
            "main",
            "/path"
        )
        self.assertEqual(working_file["revision"], 1)
        working_files = files_service.get_working_files_for_task(self.task.id)
        working_file = files_service.create_new_working_revision(
            self.task.id,
            self.person.id,
            self.software.id,
            "main",
            "/path"
        )
        working_files = files_service.get_working_files_for_task(self.task.id)
        self.assertEqual(working_file["revision"], 2)
        self.assertEquals(len(working_files), 2)

        with pytest.raises(EntryAlreadyExistsException):
            working_file = files_service.create_new_working_revision(
                self.task.id,
                self.person.id,
                self.software.id,
                "main",
                "/path",
                revision=2
            )

    def test_get_next_output_file_revision(self):
        revision = files_service.get_next_output_file_revision(
            self.entity.id,
            self.output_type.id,
            self.task_type.id
        )

        self.assertEqual(revision, 2)

    def test_create_new_output_revision(self):
        self.output_file.delete()
        output_file = files_service.create_new_output_revision(
            self.entity.id,
            self.working_file.id,
            self.output_type.id,
            self.person.id,
            self.task_type.id
        )
        self.assertEqual(output_file["revision"], 1)
        output_file = files_service.create_new_output_revision(
            self.entity.id,
            self.working_file.id,
            self.output_type.id,
            self.person.id,
            self.task_type.id
        )
        self.assertEqual(output_file["revision"], 2)

        output_file = files_service.get_last_output_revision(
            self.entity.id,
            self.output_type.id,
            self.task_type.id
        )
        self.assertEqual(output_file["revision"], 2)

        with pytest.raises(EntryAlreadyExistsException):
            output_file = files_service.create_new_output_revision(
                self.entity.id,
                self.working_file.id,
                self.output_type.id,
                self.person.id,
                self.task_type.id,
                revision=1
            )

    def test_get_last_output_files_for_entity(self):
        geometry = self.output_type
        cache = self.generate_fixture_output_type(
            name="Cache",
            short_name="cch"
        )

        self.generate_fixture_output_file(geometry, 2)
        self.generate_fixture_output_file(geometry, 3)
        self.generate_fixture_output_file(geometry, 4)
        geometry_file = self.generate_fixture_output_file(geometry, 5)
        self.generate_fixture_output_file(cache, 1)
        self.generate_fixture_output_file(cache, 2)
        cache_file = self.generate_fixture_output_file(cache, 3)

        last_output_files = files_service.get_last_output_files_for_entity(
            self.entity.id
        )
        self.assertEquals(
            last_output_files[str(geometry.id)][geometry_file.name]["revision"],
            5
        )
        self.assertEquals(
            last_output_files[str(cache.id)][cache_file.name]["revision"],
            3
        )

    def test_get_output_files_for_output_type_and_entity(self):
        geometry = self.output_type
        self.generate_fixture_output_file(geometry, 1, representation="obj")
        self.generate_fixture_output_file(geometry, 2, representation="obj")
        self.generate_fixture_output_file(geometry, 3, representation="obj")
        self.generate_fixture_output_file(geometry, 4, representation="obj")

        self.generate_fixture_output_file(geometry, 1, representation="max")
        self.generate_fixture_output_file(geometry, 2, representation="max")
        self.generate_fixture_output_file(geometry, 3, representation="max")

        output_files = \
            files_service.get_output_files_for_output_type_and_entity(
                self.entity.id,
                geometry.id
            )
        self.assertEquals(len(output_files), 8)

        output_files = \
            files_service.get_output_files_for_output_type_and_entity(
                str(self.entity.id),
                geometry.id,
                representation="obj"
            )
        self.assertEquals(len(output_files), 4)

        output_files = \
            files_service.get_output_files_for_output_type_and_entity(
                str(self.entity.id),
                geometry.id,
                representation="max"
            )
        self.assertEquals(len(output_files), 3)

    def test_get_output_files_for_output_type_and_asset_instance(self):
        asset_instance = self.generate_fixture_shot_asset_instance(
            asset=self.entity,
            shot=self.shot
        )
        geometry = self.output_type
        self.generate_fixture_output_file(
            geometry, 1, representation="obj", asset_instance=asset_instance)
        self.generate_fixture_output_file(
            geometry, 2, representation="obj", asset_instance=asset_instance)
        self.generate_fixture_output_file(
            geometry, 3, representation="obj", asset_instance=asset_instance)
        self.generate_fixture_output_file(
            geometry, 4, representation="obj", asset_instance=asset_instance)

        self.generate_fixture_output_file(
            geometry, 1, representation="max", asset_instance=asset_instance)
        self.generate_fixture_output_file(
            geometry, 2, representation="max", asset_instance=asset_instance)
        self.generate_fixture_output_file(
            geometry, 3, representation="max", asset_instance=asset_instance)

        output_files = \
            files_service.get_output_files_for_output_type_and_asset_instance(
                asset_instance.id,
                geometry.id
            )
        self.assertEquals(len(output_files), 7)

        output_files = \
            files_service.get_output_files_for_output_type_and_asset_instance(
                asset_instance.id,
                geometry.id,
                representation="obj"
            )
        self.assertEquals(len(output_files), 4)

        output_files = \
            files_service.get_output_files_for_output_type_and_asset_instance(
                asset_instance.id,
                geometry.id,
                representation="max"
            )
        self.assertEquals(len(output_files), 3)
