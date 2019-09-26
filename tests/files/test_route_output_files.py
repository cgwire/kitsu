from tests.base import ApiDBTestCase

from zou.app.models.output_type import OutputType

from zou.app.services import files_service, tasks_service


class RouteOutputFilesTestCase(ApiDBTestCase):

    def setUp(self):
        super(RouteOutputFilesTestCase, self).setUp()

        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_asset_type()
        self.generate_fixture_asset()
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
        self.asset_id = str(self.asset.id)
        self.task_type_id = str(self.task_type.id)

    def new_output(self, data, code=201):
        return self.post(
            "data/entities/%s/output-files/new" % self.asset_id,
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
            "/data/entities/%s/output-files/last-revisions" % self.asset.id
        )

        self.assertIn(self.output_file_geometry.serialize(), output_files)
        self.assertIn(self.output_file_cache.serialize(), output_files)
        self.assertIn(self.output_file_texture.serialize(), output_files)
        self.assertIn(self.output_file_render_1.serialize(), output_files)
        self.assertIn(self.output_file_render_2.serialize(), output_files)

    def test_get_entity_output_types(self):
        self.generate_output_files()
        alembic = self.generate_fixture_output_type("Alembic", "ab")
        self.generate_fixture_output_file(
            alembic,
            1,
            task=self.shot_task
        )
        output_types = self.get(
            "/data/entities/%s/output-types" % self.asset.id
        )
        self.assertEqual(len(output_types), 4)
        self.assertEqual(output_types[0]["name"], "Cache")

    def test_get_entity_output_type_output_files(self):
        self.generate_output_files()
        output_files = self.get(
            "/data/entities/%s/output-types/%s/output-files" % (
                self.asset.id,
                self.cache_type_id
            )
        )
        self.assertEqual(len(output_files), 3)
        self.assertEqual(
            output_files[0]["output_type_id"],
            self.cache_type_id
        )

    def test_new_output(self):
        data = {
            "person_id": self.person_id,
            "comment": "test working file publish",
            "output_type_id": self.tx_type_id,
            "task_type_id": self.task_type_id,
            "working_file_id": self.working_file_id,
        }
        result = self.new_output(data)

        self.assertEqual(
            result["folder_path"],
            "/simple/productions/export/cosmos_landromat/assets/props/tree/"
            "shaders/texture"
        )
        self.assertEqual(
            result["file_name"],
            "cosmos_landromat_props_tree_shaders_texture_main_v001"
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
            "task_type_id": self.task_type_id,
            "working_file_id": self.working_file_id,
            "extension": ".tx"
        }
        result = self.new_output(data)
        output_file_id = result["id"]
        output_file = self.get("/data/output-files/%s" % output_file_id)

        self.assertEqual(output_file["extension"], ".tx")
        self.assertEqual(
            output_file["path"],
            "/simple/productions/export/cosmos_landromat/assets/props/tree/"
            "shaders/texture/"
            "cosmos_landromat_props_tree_shaders_texture_main_v001.tx"
        )

    def test_new_output_without_source_file(self):
        data = {
            "person_id": self.person_id,
            "comment": "test working file publish with extension",
            "output_type_id": self.tx_type_id,
            "task_type_id": self.task_type_id,
            "extension": ".tx"
        }
        result = self.new_output(data)
        output_file_id = result["id"]
        output_file = self.get("/data/output-files/%s" % output_file_id)

        self.assertEqual(output_file["extension"], ".tx")
        self.assertEqual(
            output_file["path"],
            "/simple/productions/export/cosmos_landromat/assets/props/tree/"
            "shaders/texture/"
            "cosmos_landromat_props_tree_shaders_texture_main_v001.tx"
        )

    def test_new_output_with_name(self):
        data = {
            "person_id": self.person_id,
            "comment": "test working file publish with extension",
            "output_type_id": self.tx_type_id,
            "task_type_id": self.task_type_id,
            "working_file_id": self.working_file_id,
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
            "shaders/texture/"
            "cosmos_landromat_props_tree_shaders_texture_special_v001.tx"
        )

    def test_new_output_with_extension_and_elements(self):
        data = {
            "person_id": self.person_id,
            "comment": "test working file publish with extension",
            "output_type_id": self.tx_type_id,
            "task_type_id": self.task_type_id,
            "working_file_id": self.working_file_id,
            "extension": ".jpg",
            "nb_elements": 50,
            "name": "special"
        }
        result = self.new_output(data)
        output_file_id = result["id"]
        output_file = self.get("/data/output-files/%s" % output_file_id)

        self.assertEqual(output_file["extension"], ".jpg")
        self.assertEqual(output_file["nb_elements"], 50)
        self.assertEqual(
            output_file["path"],
            "/simple/productions/export/cosmos_landromat/assets/props/tree/"
            "shaders/texture/"
            "cosmos_landromat_props_tree_shaders_"
            "texture_special_v001_[1-50].jpg"
        )

    def test_new_output_again(self):
        data = {
            "comment": "test working file publish",
            "person_id": self.person_id,
            "output_type_id": self.tx_type_id,
            "task_type_id": self.task_type_id,
            "working_file_id": self.working_file_id
        }
        result = self.new_output(data)
        result = self.new_output(data)

        self.assertEqual(
            result["folder_path"],
            "/simple/productions/export/cosmos_landromat/assets/props/tree/"
            "shaders/texture"
        )
        self.assertEqual(
            result["file_name"],
            "cosmos_landromat_props_tree_shaders_texture_main_v002"
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
            "task_type_id": self.task_type_id,
            "working_file_id": self.working_file_id,
            "revision": 66
        }
        result = self.new_output(data)

        self.assertEqual(
            result["file_name"],
            "cosmos_landromat_props_tree_shaders_texture_main_v066"
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
            "task_type_id": self.task_type_id,
            "working_file_id": self.working_file_id,
            "revision": 66
        }
        self.new_output(data)
        self.new_output(data, 400)

    def test_to_review(self):
        data = {"person_id": str(self.person_id)}
        status_id = str(tasks_service.get_to_review_status()["id"])
        self.put("/actions/tasks/%s/to-review" % self.task_id, data)
        task = self.get("data/tasks/%s" % self.task_id)
        self.assertEqual(task["task_status_id"], status_id)

    def test_get_next_revision(self):
        self.generate_fixture_output_type()
        self.generate_fixture_output_file()
        result = self.post(
            "/data/entities/%s/output-files/next-revision" % self.asset.id,
            {
                "output_type_id": self.output_type.id,
                "task_type_id": self.task_type_id
            },
            200
        )
        self.assertEqual(result["next_revision"], 2)

    def test_get_next_revision_with_name(self):
        self.generate_fixture_output_type()
        self.generate_fixture_output_file(revision=5, name="other-output")
        result = self.post(
            "/data/entities/%s/output-files/next-revision" % self.asset.id,
            {
                "name": "other-output",
                "output_type_id": self.output_type.id,
                "task_type_id": self.task_type_id
            },
            200
        )
        self.assertEqual(result["next_revision"], 6)

    def test_get_next_revision_wrong_data(self):
        self.generate_fixture_output_type()
        self.post(
            "/data/entities/unknown/output-files/next-revision",
            {
                "name": "main",
                "output_type_id": self.output_type.id,
                "task_type_id": self.task_type_id
            },
            404
        )

    def test_get_next_revision_with_empty_revision(self):
        self.generate_fixture_output_type()
        result = self.post(
            "/data/entities/%s/output-files/next-revision" % self.asset.id,
            {
                "name": "main",
                "output_type_id": self.output_type.id,
                "task_type_id": self.task_type_id
            },
            200
        )
        self.assertEqual(result["next_revision"], 1)

    def test_new_instance_output(self):
        self.generate_fixture_scene()
        self.generate_fixture_scene_asset_instance()
        self.generate_fixture_shot_asset_instance(
            self.shot,
            self.asset_instance
        )
        data = {
            "person_id": self.person_id,
            "comment": "test working file publish",
            "output_type_id": self.cache_type_id,
            "task_type_id": self.task_type_animation.id,
            "working_file_id": self.working_file_id,
            "representation": "abc"
        }
        result = self.post(
            "data/asset-instances/%s/entities/%s/output-files/new" % (
                self.asset_instance.id,
                self.shot.id
            ),
            data
        )

        self.assertEqual(
            result["folder_path"],
            "/simple/productions/export/cosmos_landromat/shot/s01/p01/"
            "animation/cache/props/tree/instance_0001/abc"
        )
        self.assertEqual(
            result["file_name"],
            "cosmos_landromat_s01_p01_animation_cache_main_tree_"
            "0001_v001"
        )
        self.assertEqual(
            result["path"],
            "/simple/productions/export/cosmos_landromat/shot/s01/p01/"
            "animation/cache/props/tree/instance_0001/abc/cosmos_landromat_s01_"
            "p01_animation_cache_main_tree_0001_v001"
        )

        output_file_id = result["id"]
        output_file = self.get("/data/output-files/%s" % output_file_id)

        self.assertEqual(output_file["comment"], data["comment"])
        self.assertEqual(output_file["revision"], 1)
        self.assertEqual(output_file["source_file_id"], self.working_file_id)

    def test_get_next_instance_revision(self):
        self.generate_fixture_scene()
        self.generate_fixture_scene_asset_instance()
        self.generate_fixture_shot_asset_instance(
            self.shot,
            self.asset_instance
        )
        self.task_type_animation_id = self.task_type_animation.id
        asset_instance_id = self.asset_instance.id
        shot_id = self.shot.id

        data = {
            "person_id": self.person_id,
            "comment": "test working file publish",
            "output_type_id": self.cache_type_id,
            "task_type_id": self.task_type_animation.id,
            "working_file_id": self.working_file_id
        }
        self.post(
            "data/asset-instances/%s/entities/%s/output-files/new" % (
                asset_instance_id,
                shot_id
            ), data
        )

        data = {
            "output_type_id": self.cache_type_id,
            "task_type_id": self.task_type_animation_id,
            "name": "main"
        }
        result = self.post(
            "data/asset-instances/%s/entities/%s/output-files/next-revision" % (
                asset_instance_id,
                shot_id
            ),
            data,
            200
        )
        self.assertEqual(result["next_revision"], 2)

    def test_get_last_instance_outputs(self):
        self.generate_fixture_scene()
        self.generate_fixture_scene_asset_instance()
        self.generate_fixture_shot_asset_instance(
            self.shot,
            self.asset_instance
        )
        self.task_type_animation_id = str(self.task_type_animation.id)
        asset_instance_id = str(self.asset_instance.id)
        shot_id = str(self.shot.id)

        data = {
            "person_id": self.person_id,
            "comment": "test working file publish",
            "output_type_id": self.cache_type_id,
            "task_type_id": self.task_type_animation.id,
            "working_file_id": self.working_file_id
        }
        output_file = self.post(
            "data/asset-instances/%s/entities/%s/output-files/new" % (
                asset_instance_id,
                shot_id
            ), data
        )

        result = self.get(
            "data/asset-instances/%s/entities/%s/output-files/last-revisions" % (
                asset_instance_id,
                shot_id
            )
        )
        self.assertIn(output_file["id"], [f['id'] for f in result])

    def test_new_asset_asset_instance_output(self):
        self.generate_fixture_asset_types()
        self.generate_fixture_asset_character()
        self.generate_fixture_asset_asset_instance()
        data = {
            "person_id": self.person_id,
            "comment": "test working file publish",
            "output_type_id": self.tx_type_id,
            "task_type_id": self.task_type.id,
            "working_file_id": self.working_file_id,
            "representation": ".tx"
        }
        result = self.post(
            "data/asset-instances/%s/entities/%s/output-files/new" % (
                self.asset_instance.id,
                self.asset.id
            ),
            data
        )

        self.assertEqual(
            result["folder_path"],
            "/simple/productions/export/cosmos_landromat/assets/props/tree/"
            "shaders/texture/character/rabbit/instance_0001/tx"
        )
        self.assertEqual(
            result["file_name"],
            "cosmos_landromat_props_tree_shaders_texture_main_rabbit_"
            "0001_v001"
        )
        self.assertEqual(
            result["path"],
            "/simple/productions/export/cosmos_landromat/assets/props/tree/"
            "shaders/texture/character/rabbit/instance_0001/tx/"
            "cosmos_landromat_props_tree_shaders_texture_main_rabbit_"
            "0001_v001"
        )

        output_file_id = result["id"]
        output_file = self.get("/data/output-files/%s" % output_file_id)

        self.assertEqual(output_file["comment"], data["comment"])
        self.assertEqual(output_file["revision"], 1)
        self.assertEqual(output_file["source_file_id"], self.working_file_id)

    def test_get_next_asset_asset_instance_revision(self):
        self.generate_fixture_asset_types()
        self.generate_fixture_asset_character()
        self.generate_fixture_asset_asset_instance()

        self.task_type_id = self.task_type.id
        asset_instance_id = self.asset_instance.id
        asset_id = self.asset.id

        data = {
            "person_id": self.person_id,
            "comment": "test working file publish",
            "output_type_id": self.tx_type_id,
            "task_type_id": self.task_type.id,
            "working_file_id": self.working_file_id
        }
        self.post(
            "data/asset-instances/%s/entities/%s/output-files/new" % (
                asset_instance_id,
                asset_id
            ), data
        )

        data = {
            "output_type_id": self.tx_type_id,
            "task_type_id": self.task_type_id,
            "name": "main"
        }
        result = self.post(
            "data/asset-instances/%s/entities/%s/output-files/next-revision" % (
                asset_instance_id,
                asset_id
            ),
            data,
            200
        )
        self.assertEqual(result["next_revision"], 2)

    def test_get_last_asset_asset_instance_outputs(self):
        self.generate_fixture_asset_types()
        self.generate_fixture_asset_character()
        self.generate_fixture_asset_asset_instance()

        self.task_type_id = self.task_type.id
        asset_instance_id = self.asset_instance.id
        asset_id = self.asset.id

        data = {
            "person_id": self.person_id,
            "comment": "test working file publish",
            "output_type_id": self.tx_type_id,
            "task_type_id": self.task_type_id,
            "working_file_id": self.working_file_id
        }
        output_file = self.post(
            "data/asset-instances/%s/entities/%s/output-files/new" % (
                asset_instance_id,
                asset_id
            ), data
        )

        result = self.get(
            "data/asset-instances/%s/entities/%s/output-files/"
            "last-revisions" % (
                asset_instance_id,
                asset_id
            )
        )
        assert(
            output_file["id"] in [f['id'] for f in result]
        )


    def test_get_output_types(self):
        self.generate_fixture_scene()
        self.generate_fixture_scene_asset_instance()
        self.generate_fixture_shot_asset_instance(
            self.shot,
            self.asset_instance
        )
        self.task_type_animation_id = str(self.task_type_animation.id)
        asset_instance_id = str(self.asset_instance.id)
        shot_id = str(self.shot.id)

        data = {
            "person_id": self.person_id,
            "temporal_entity_id": self.shot.id,
            "comment": "test working file publish",
            "output_type_id": self.cache_type_id,
            "task_type_id": self.task_type_animation.id,
            "working_file_id": self.working_file_id
        }
        self.post(
            "data/asset-instances/%s/entities/%s/output-files/new" % (
                asset_instance_id,
                shot_id
            ), data
        )

        result = self.get(
            "data/asset-instances/%s/entities/%s/output-types" % (
                asset_instance_id,
                shot_id
            )
        )
        self.assertEqual(
            result[0]["id"],
            self.cache_type_id
        )

    def test_get_output_files_for_output_type_and_entity(self):
        self.generate_fixture_output_type()
        geometry = self.output_type
        self.generate_fixture_output_file(geometry, 1, representation="obj")
        self.generate_fixture_output_file(geometry, 2, representation="obj")
        self.generate_fixture_output_file(geometry, 3, representation="obj")
        self.generate_fixture_output_file(geometry, 4, representation="obj")

        self.generate_fixture_output_file(geometry, 1, representation="max")
        self.generate_fixture_output_file(geometry, 2, representation="max")
        self.generate_fixture_output_file(geometry, 3, representation="max")

        output_files = self.get(
            "data/entities/%s/output-types/%s/output-files" % (
                self.asset.id, geometry.id
            ))
        self.assertEqual(len(output_files), 7)

        output_files = self.get(
            "data/entities/%s/output-types/%s/"
            "output-files?representation=obj" % (
                self.asset.id, geometry.id
            ))
        self.assertEqual(len(output_files), 4)

        output_files = self.get(
            "data/entities/%s/output-types/%s/"
            "output-files?representation=max" % (
                self.asset.id, geometry.id
            ))
        self.assertEqual(len(output_files), 3)

    def test_get_output_files_for_output_type_and_asset_instance(self):
        self.generate_fixture_scene()
        self.generate_fixture_scene_asset_instance()
        self.generate_fixture_shot_asset_instance(
            self.shot,
            self.asset_instance
        )
        self.generate_fixture_output_type()
        geometry = self.output_type
        self.generate_fixture_output_file(
            geometry, 1, representation="obj",
            asset_instance=self.asset_instance)
        self.generate_fixture_output_file(
            geometry, 2, representation="obj",
            asset_instance=self.asset_instance)
        self.generate_fixture_output_file(
            geometry, 3, representation="obj",
            asset_instance=self.asset_instance)
        self.generate_fixture_output_file(
            geometry, 4, representation="obj",
            asset_instance=self.asset_instance)

        self.generate_fixture_output_file(
            geometry, 1, representation="max",
            asset_instance=self.asset_instance)
        self.generate_fixture_output_file(
            geometry, 2, representation="max",
            asset_instance=self.asset_instance)
        self.generate_fixture_output_file(
            geometry, 3, representation="max",
            asset_instance=self.asset_instance)

        output_files = self.get(
            "data/asset-instances/%s/entities/%s/"
            "output-types/%s/output-files" % (
                self.asset_instance.id, self.scene.id, geometry.id
            ))
        self.assertEqual(len(output_files), 7)

        output_files = self.get(
            "data/asset-instances/%s/entities/%s/output-types/%s/"
            "output-files?representation=obj" % (
                self.asset_instance.id, self.scene.id, geometry.id
            ))
        self.assertEqual(len(output_files), 4)

        output_files = self.get(
            "data/asset-instances/%s/entities/%s/output-types/%s/"
            "output-files?representation=max" % (
                self.asset_instance.id, self.scene.id, geometry.id
            ))
        self.assertEqual(len(output_files), 3)
