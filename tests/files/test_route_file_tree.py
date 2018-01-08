from tests.base import ApiDBTestCase

from zou.app.services import files_service


class FolderPathTestCase(ApiDBTestCase):

    def setUp(self):
        super(FolderPathTestCase, self).setUp()

        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_person()
        self.generate_fixture_assigner()
        self.generate_fixture_entity_type()
        self.generate_fixture_entity()
        self.generate_fixture_sequence()
        self.generate_fixture_shot()
        self.generate_fixture_scene()
        self.generate_fixture_department()
        self.generate_fixture_task_type()
        self.generate_fixture_task_status()
        self.generate_fixture_shot_task()
        self.generate_fixture_scene_task()
        self.generate_fixture_task()
        self.generate_fixture_software()

    def test_get_path_shot(self):
        data = {
            "mode": "working",
            "software": self.software_max.id
        }
        result = self.post(
            "/data/tasks/%s/folder-path" % self.shot_task.id, data, 200)
        self.assertEquals(
            result["path"],
            "/simple/productions/cosmos_landromat/shots/s01/p01/animation/"
            "3ds_max"
        )

    def test_get_path_scene(self):
        data = {
            "mode": "working",
            "software": self.software_max.id
        }
        result = self.post(
            "/data/tasks/%s/folder-path" % self.scene_task.id,
            data,
            200
        )
        self.assertEquals(
            result["path"],
            "/simple/productions/cosmos_landromat/scenes/s01/sc01/animation/"
            "3ds_max"
        )

    def test_get_file_path_asset(self):
        self.generate_fixture_working_file("hotfix", revision=1)
        self.generate_fixture_working_file("hotfix", revision=2)
        self.generate_fixture_working_file("hotfix", revision=3)
        self.generate_fixture_working_file("hotfix", revision=4)

        task_id = str(self.task.id)
        data = {
            "mode": "working",
            "name": "main"
        }
        result = self.post("/data/tasks/%s/file-path" % task_id, data, 200)
        self.assertEquals(
            result["path"],
            "/simple/productions/cosmos_landromat/assets/props/tree/shaders/"
            "3ds_max"
        )
        self.assertEquals(
            result["name"],
            "cosmos_landromat_props_tree_shaders_main_v001"
        )

        data = {
            "mode": "working",
            "name": "hotfix"
        }
        result = self.post("/data/tasks/%s/file-path" % task_id, data, 200)
        self.assertEquals(
            result["name"],
            "cosmos_landromat_props_tree_shaders_hotfix_v005"
        )

        data = {
            "mode": "working",
            "name": "hotfix",
            "version": 3
        }
        result = self.post("/data/tasks/%s/file-path" % task_id, data, 200)
        self.assertEquals(
            result["name"],
            "cosmos_landromat_props_tree_shaders_hotfix_v003"
        )

    def test_get_folder_path_asset(self):
        data = {
            "mode": "working"
        }
        result = self.post(
            "/data/tasks/%s/folder-path" % self.task.id, data, 200
        )
        self.assertEquals(
            result["path"],
            "/simple/productions/cosmos_landromat/assets/props/tree/"
            "shaders/3ds_max"
        )

    def test_get_path_shot_asset_instance(self):
        self.output_type = files_service.get_or_create_output_type("Cache")
        self.generate_fixture_shot_asset_instance(
            asset=self.entity,
            shot=self.shot
        )
        data = {
            "name": "main",
            "version": 3
        }
        result = self.post(
            "/data/asset-instances/%s/output-types/%s/file-path" % (
                self.asset_instance.id,
                self.output_type["id"]
            ),
            data,
            200
        )
        self.assertEquals(
            result["path"],
            "/simple/productions/export/cosmos_landromat/shots/s01/p01/cache/"
            "props/tree/instance_1"
        )
        self.assertEquals(
            result["name"],
            "cosmos_landromat_s01_p01_cache_main_props_tree_instance_1_v003"
        )

    def test_get_path_scene_asset_instance(self):
        self.output_type = files_service.get_or_create_output_type("Cache")
        self.generate_fixture_scene_asset_instance(
            asset=self.entity,
            scene=self.scene
        )
        data = {
            "name": "main",
            "version": 3
        }
        result = self.post(
            "/data/asset-instances/%s/output-types/%s/file-path" % (
                self.asset_instance.id,
                self.output_type["id"]
            ),
            data,
            200
        )
        self.assertEquals(
            result["path"],
            "/simple/productions/export/cosmos_landromat/scenes/s01/sc01/cache/"
            "props/tree/instance_1"
        )
        self.assertEquals(
            result["name"],
            "cosmos_landromat_s01_sc01_cache_main_props_tree_instance_1_v003"
        )

    def test_get_path_asset_software(self):
        data = {
            "mode": "working",
            "software_id": self.software.id
        }
        result = self.post(
            "/data/tasks/%s/folder-path" % self.task.id, data, 200)
        self.assertEquals(
            result["path"],
            "/simple/productions/cosmos_landromat/assets/props/tree/shaders/"
            "blender"
        )

    def test_get_file_path_asset_with_version(self):
        data = {
            "mode": "working",
            "version": 3
        }
        result = self.post("/data/tasks/%s/file-path" % self.task.id, data, 200)
        self.assertEquals(
            result["path"],
            "/simple/productions/cosmos_landromat/assets/props/tree/shaders/"
            "3ds_max"
        )
        self.assertEquals(
            result["name"],
            "cosmos_landromat_props_tree_shaders_v003"
        )

    def test_get_folder_separator(self):
        data = {
            "mode": "working",
            "sep": "\\"
        }
        result = self.post(
            "data/tasks/%s/folder-path" % self.task.id,
            data,
            200
        )
        self.assertEquals(
            result["path"],
            "/simple\\productions\\cosmos_landromat\\assets\\props\\tree\\"
            "shaders\\3ds_max"
        )

    def test_get_file_separator(self):
        data = {
            "mode": "working",
            "sep": "\\"
        }
        result = self.post("data/tasks/%s/file-path" % self.task.id, data, 200)
        self.assertEquals(
            result["path"],
            "/simple\\productions\\cosmos_landromat\\assets\\props\\tree\\"
            "shaders\\3ds_max"
        )

    def test_get_path_wrong_task_id(self):
        data = {
            "mode": "working"
        }
        self.post("/data/tasks/%s/folder-path" % self.task_type.id, data, 404)

    def test_get_name_wrong_task_id(self):
        data = {
            "mode": "working",
            "task_id": self.task_type.id
        }
        self.post("/data/tasks/%s/file-path" % self.task_type.id, data, 404)

    def test_get_path_wrong_mode(self):
        data = {
            "mode": "unknown"
        }
        self.post("/data/tasks/%s/folder-path" % self.task.id, data, 400)
