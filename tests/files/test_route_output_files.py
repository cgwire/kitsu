from tests.base import ApiDBTestCase

from zou.app.models.output_type import OutputType

from zou.app.services import files_service, tasks_service


class RouteOutputFilesTestCase(ApiDBTestCase):

    def setUp(self):
        super(RouteOutputFilesTestCase, self).setUp()

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
        self.generate_fixture_file_status()

        self.task_id = str(self.task.id)
        self.tx_type_id = str(
            files_service.get_or_create_output_type("Texture", "tx")["id"]
        )
        self.cache_type_id = str(
            files_service.get_or_create_output_type("Cache", "cch")["id"]
        )
        self.render_id = str(
            files_service.get_or_create_output_type("Render", "rdr")["id"]
        )
        self.maxDiff = None
        self.task_id = self.task.id
        self.person_id = str(self.person.id)
        self.working_file_id = str(self.working_file.id)

    def new_output(self, data, code=201):
        return self.post(
            "data/working-files/%s/output-files/new" % self.working_file_id,
            data,
            code
        )

    def generate_output_files(self):
        geometry = self.generate_fixture_output_type()
        self.geometry_id = str(geometry.id)
        cache = OutputType.get(self.cache_type_id)
        texture = OutputType.get(self.tx_type_id)
        render = OutputType.get(self.render_id)

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

        self.generate_fixture_output_file(render, 1)
        self.output_file_render_1 = self.generate_fixture_output_file(
            render,
            2
        )
        self.output_file_render_2 = self.generate_fixture_output_file(
            render,
            1,
            "variant-1"
        )

    def test_get_last_output_files(self):
        self.generate_output_files()
        output_files = self.get(
            "/data/entities/%s/last-output-files" % self.entity.id
        )
        self.assertEqual(
            output_files[str(self.geometry_id)]["main"],
            self.output_file_geometry.serialize()
        )
        self.assertEqual(
            output_files[str(self.cache_type_id)]["main"],
            self.output_file_cache.serialize()
        )
        self.assertEqual(
            output_files[str(self.tx_type_id)]["main"],
            self.output_file_texture.serialize()
        )
        self.assertEqual(
            output_files[str(self.render_id)]["main"],
            self.output_file_render_1.serialize()
        )
        self.assertEqual(
            output_files[str(self.render_id)]["variant-1"],
            self.output_file_render_2.serialize()
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
        self.assertEquals(len(output_types), 4)
        self.assertEquals(output_types[0]["name"], "Geometry")

    def test_get_entity_output_type_output_files(self):
        self.generate_output_files()
        output_files = self.get(
            "/data/entities/%s/output-types/%s/output-files" % (
                self.entity.id,
                self.cache_type_id
            )
        )
        self.assertEquals(len(output_files), 3)
        self.assertEquals(
            output_files[0]["output_type_id"],
            self.cache_type_id
        )

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
            "texture"
        )
        self.assertEqual(
            result["file_name"],
            "cosmos_landromat_props_tree_texture_main_v001"
        )

        output_file_id = result["id"]
        output_file = self.get("/data/output-files/%s" % output_file_id)

        self.assertEqual(output_file["comment"], data["comment"])
        self.assertEqual(output_file["revision"], 1)
        self.assertEqual(output_file["source_file_id"], self.working_file_id)

    def test_new_output_with_extension(self):
        data = {
            "person_id": self.person_id,
            "comment": "test working file publish with extension",
            "output_type_id": self.tx_type_id,
            "extension": ".tx"
        }
        result = self.new_output(data)
        output_file_id = result["id"]
        output_file = self.get("/data/output-files/%s" % output_file_id)

        self.assertEqual(output_file["extension"], ".tx")
        self.assertEqual(
            output_file["path"],
            "/simple/productions/export/cosmos_landromat/assets/props/tree/"
            "texture/"
            "cosmos_landromat_props_tree_texture_main_v001.tx"
        )

    def test_new_output_with_name(self):
        data = {
            "person_id": self.person_id,
            "comment": "test working file publish with extension",
            "output_type_id": self.tx_type_id,
            "extension": ".tx",
            "name": "special"
        }
        result = self.new_output(data)
        output_file_id = result["id"]
        output_file = self.get("/data/output-files/%s" % output_file_id)

        self.assertEqual(output_file["extension"], ".tx")
        self.assertEqual(
            output_file["path"],
            "/simple/productions/export/cosmos_landromat/assets/props/tree/"
            "texture/"
            "cosmos_landromat_props_tree_texture_special_v001.tx"
        )

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
            "texture"
        )
        self.assertEqual(
            result["file_name"],
            "cosmos_landromat_props_tree_texture_main_v002"
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
            "cosmos_landromat_props_tree_texture_main_v066"
        )

        output_file_id = result["id"]
        output_file = self.get("/data/output-files/%s" % output_file_id)
        self.assertEqual(output_file["revision"], 66)

    def test_new_output_wrong_data(self):
        data = {
            "comment_wrong": "test file publish"
        }
        self.new_output(data, 400)

    def test_create_same_output_file(self):
        data = {
            "person_id": self.person_id,
            "comment": "test working file publish",
            "output_type_id": self.tx_type_id,
            "revision": 66
        }
        self.new_output(data)
        self.new_output(data, 400)

    def test_to_review(self):
        data = {"person_id": str(self.person_id)}
        status_id = str(tasks_service.get_to_review_status()["id"])
        self.put("/actions/tasks/%s/to-review" % self.task_id, data)
        task = self.get("data/tasks/%s" % self.task_id)
        self.assertEquals(task["task_status_id"], status_id)
