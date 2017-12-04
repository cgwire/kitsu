from tests.base import ApiDBTestCase


class TaskOutputFilesTestCase(ApiDBTestCase):

    def setUp(self):
        super(TaskOutputFilesTestCase, self).setUp()

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
        self.generate_fixture_shot_working_file()
        self.generate_fixture_file_status()
        self.maxDiff = None
        self.task_id = self.task.id

    def generate_output_files(self):
        geometry = self.generate_fixture_output_type()
        self.geometry_id = str(geometry.id)
        cache = self.generate_fixture_output_type("Cache", "cch")
        self.cache_id = str(cache.id)
        texture = self.generate_fixture_output_type("Texture", "tx")
        self.texture_id = str(texture.id)

        self.generate_fixture_output_file(geometry, 1)
        self.generate_fixture_output_file(geometry, 2)
        self.generate_fixture_output_file(geometry, 3)
        self.generate_fixture_output_file(geometry, 4)
        self.output_file_geometry = self.generate_fixture_output_file(
            geometry,
            5
        )
        self.generate_fixture_output_file(cache, 1)
        self.generate_fixture_output_file(cache, 2)
        self.output_file_cache = self.generate_fixture_output_file(
            cache,
            3
        )
        self.output_file_texture = self.generate_fixture_output_file(
            texture,
            1
        )

    def test_get_last_output_files(self):
        self.generate_output_files()
        output_files = self.get(
            "/data/tasks/%s/last-output-files" % self.task.id
        )
        self.assertEqual(
            output_files[str(self.geometry_id)],
            self.output_file_geometry.serialize()
        )
        self.assertEqual(
            output_files[str(self.cache_id)],
            self.output_file_cache.serialize()
        )
        self.assertEqual(
            output_files[str(self.texture_id)],
            self.output_file_texture.serialize()
        )

    def test_get_entity_output_types(self):
        self.generate_output_files()
        alembic = self.generate_fixture_output_type("Alembic", "ab")
        self.generate_fixture_output_file(
            alembic,
            1,
            task=self.shot_task
        )
        output_types = self.get(
            "/data/entities/%s/output-types" % self.entity.id
        )
        self.assertEquals(len(output_types), 3)
        self.assertEquals(output_types[0]["name"], "Geometry")

    def test_get_entity_output_type_output_files(self):
        self.generate_output_files()
        output_files = self.get(
            "/data/entities/%s/output-types/%s/output-files" % (
                self.entity.id,
                self.cache_id
            )
        )
        self.assertEquals(len(output_files), 3)
        self.assertEquals(output_files[0]["output_type_id"], self.cache_id)
