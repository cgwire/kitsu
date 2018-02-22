from tests.base import ApiDBTestCase

from zou.app.services import file_tree_service, files_service
from zou.app.services.exception import MalformedFileTreeException

from zou.app.models.entity import Entity


class FileTreeTestCase(ApiDBTestCase):

    def setUp(self):
        super(FileTreeTestCase, self).setUp()
        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_project_standard()
        self.generate_fixture_entity_type()
        self.generate_fixture_entity()
        self.generate_fixture_episode()
        self.generate_fixture_sequence()
        self.generate_fixture_shot()
        self.generate_fixture_scene()
        self.generate_fixture_sequence_standard()
        self.generate_fixture_shot_standard()
        self.generate_fixture_person()
        self.generate_fixture_department()
        self.generate_fixture_task_type()
        self.generate_fixture_task_status()
        self.generate_fixture_assigner()
        self.generate_fixture_task()
        self.generate_fixture_shot_task()
        self.generate_fixture_shot_task_standard()
        self.generate_fixture_software()
        self.entity_standard = Entity(
            name='Car',
            project_id=self.project_standard.id,
            entity_type_id=self.entity_type.id
        )
        self.entity_standard.save()
        self.sequence_standard = Entity(
            name='Seq1',
            project_id=self.project.id,
            entity_type_id=self.sequence_type.id
        )
        self.sequence_standard.save()
        self.shot_standard = Entity(
            name='P001',
            project_id=self.project_standard.id,
            entity_type_id=self.shot_type.id,
            parent_id=self.sequence_standard.id
        )
        self.shot_standard.save()
        self.output_type_cache = files_service.get_or_create_output_type(
            "Cache")

    def test_get_tree_from_file(self):
        simple_tree = file_tree_service.get_tree_from_file("simple")
        self.assertIsNotNone(simple_tree["working"])

    def test_get_tree_from_project(self):
        simple_tree = file_tree_service.get_tree_from_project(
            self.project.serialize()
        )
        self.assertIsNotNone(simple_tree["working"])

    def test_join_path(self):
        self.assertEqual(file_tree_service.join_path("", "PROD"), "PROD")
        self.assertEqual(
            file_tree_service.join_path("ROOT", "PROD"), "ROOT/PROD")
        self.assertEqual(
            file_tree_service.join_path("ROOT", "PROD", "\\"), "ROOT\\PROD")

    def test_get_root_path(self):
        tree = file_tree_service.get_tree_from_file("simple")
        path = file_tree_service.get_root_path(tree, "working", "/")
        self.assertEqual(path, "/simple/productions/")

    def test_get_project(self):
        project = file_tree_service.get_project(self.entity.serialize())
        self.assertEqual(project["name"], self.project.name)

    def test_get_file_name_template(self):
        tree = file_tree_service.get_tree_from_file("standard")
        template = file_tree_service.get_file_name_template(
            tree,
            "working",
            self.shot.serialize()
        )
        self.assertEqual(template, tree["working"]["file_name"]["shot"])
        template = file_tree_service.get_file_name_template(
            tree,
            "working",
            self.entity.serialize()
        )
        self.assertEqual(template, tree["working"]["file_name"]["asset"])
        template = file_tree_service.get_file_name_template(
            tree,
            "working",
            self.sequence.serialize()
        )
        self.assertEqual(template, tree["working"]["file_name"]["sequence"])

    def test_get_folder_path_template(self):
        tree = file_tree_service.get_tree_from_file("simple")
        template = file_tree_service.get_folder_path_template(
            tree,
            "working",
            self.shot.serialize()
        )
        self.assertEqual(template, tree["working"]["folder_path"]["shot"])
        template = file_tree_service.get_folder_path_template(
            tree,
            "working",
            self.entity.serialize()
        )
        self.assertEqual(template, tree["working"]["folder_path"]["asset"])
        template = file_tree_service.get_folder_path_template(
            tree,
            "working",
            self.sequence.serialize()
        )
        self.assertEqual(template, tree["working"]["folder_path"]["sequence"])

    def test_get_folder_from_datatype_project(self):
        path = file_tree_service.get_folder_from_datatype(
            "Project",
            self.shot.serialize(),
            self.shot_task.serialize()
        )
        self.assertEquals(path, self.project.name)

    def test_get_folder_from_datatype_shot(self):
        path = file_tree_service.get_folder_from_datatype(
            "Shot",
            self.shot.serialize(),
            self.shot_task.serialize()
        )
        self.assertEquals(path, self.shot.name)

    def test_get_folder_from_datatype_sequence_shot(self):
        path = file_tree_service.get_folder_from_datatype(
            "Sequence",
            self.shot.serialize(),
            self.shot_task.serialize()
        )
        self.assertEquals(path, self.sequence.name)

    def test_get_folder_from_datatype_sequence_sequence(self):
        path = file_tree_service.get_folder_from_datatype(
            "Sequence",
            self.sequence.serialize(),
            self.shot_task.serialize()
        )
        self.assertEquals(path, self.sequence.name)

    def test_get_folder_from_datatype_episode(self):
        path = file_tree_service.get_folder_from_datatype(
            "Episode",
            self.shot.serialize(),
            self.task.serialize()
        )
        self.assertEquals(path, "E01")
        path = file_tree_service.get_folder_from_datatype(
            "Episode",
            self.sequence.serialize(),
            self.task.serialize()
        )
        self.assertEquals(path, "E01")

    def test_get_folder_from_datatype_asset(self):
        path = file_tree_service.get_folder_from_datatype(
            "Asset",
            self.entity.serialize(),
            self.task.serialize()
        )
        self.assertEquals(path, self.entity.name)

    def test_get_folder_from_datatype_asset_type(self):
        path = file_tree_service.get_folder_from_datatype(
            "AssetType",
            self.entity.serialize(),
            self.task.serialize()
        )
        self.assertEquals(path, self.entity_type.name)

    def test_get_folder_from_datatype_department(self):
        path = file_tree_service.get_folder_from_datatype(
            "Department",
            self.entity.serialize(),
            self.task.serialize()
        )
        self.assertEquals(path, self.department.name)

    def test_get_folder_from_datatype_task(self):
        path = file_tree_service.get_folder_from_datatype(
            "Task",
            self.entity.serialize(),
            self.task.serialize()
        )
        self.assertEquals(path, self.task.name)

    def test_get_folder_from_datatype_task_type(self):
        path = file_tree_service.get_folder_from_datatype(
            "TaskType",
            self.entity.serialize(),
            task=self.task.serialize()
        )
        self.assertEquals(path, self.task_type.name)
        path = file_tree_service.get_folder_from_datatype(
            "TaskType",
            self.entity.serialize(),
            task_type=self.task_type.serialize()
        )
        self.assertEquals(path, self.task_type.name)

    def test_get_folder_from_datatype_software(self):
        path = file_tree_service.get_folder_from_datatype(
            "Software",
            self.entity.serialize(),
            self.task.serialize(),
            software=self.software.serialize()
        )
        self.assertEquals(path, "Blender")

    def test_get_folder_from_datatype_output_type(self):
        path = file_tree_service.get_folder_from_datatype(
            "OutputType",
            self.entity.serialize(),
            self.task.serialize(),
            output_type=self.output_type_cache
        )
        self.assertEquals(path, "cache")

    def test_get_folder_raise_exception(self):
        self.assertRaises(
            MalformedFileTreeException,
            file_tree_service.get_folder_from_datatype,
            "Unknown",
            self.entity.serialize(),
            self.task.serialize()
        )

    def test_get_working_folder_path_shot(self):
        path = file_tree_service.get_working_folder_path(
            self.shot_task.serialize(),
            software=self.software_max.serialize()
        )
        self.assertEquals(
            path,
            "/simple/productions/cosmos_landromat/shots/s01/p01/animation/"
            "3dsmax"
        )

    def test_get_working_folder_path_with_separator(self):
        path = file_tree_service.get_working_folder_path(
            self.shot_task.serialize(),
            software=self.software_max.serialize(),
            sep="\\"
        )
        self.assertEquals(
            path,
            "/simple\\productions\\cosmos_landromat\\shots\\s01\\p01\\"
            "animation\\3dsmax"
        )

    def test_get_output_folder_path(self):
        path = file_tree_service.get_output_folder_path(
            self.shot.serialize(),
            output_type=self.output_type_cache,
            task_type=self.task_type_animation.serialize(),
            sep="/"
        )
        self.assertEquals(
            path,
            "/simple/productions/export/cosmos_landromat/shots/s01/p01/"
            "animation/cache"
        )

    def test_get_working_folder_path_with_software(self):
        path = file_tree_service.get_working_folder_path(
            self.task.serialize(),
            software=self.software.serialize()
        )
        self.assertEquals(
            path,
            "/simple/productions/cosmos_landromat/assets/props/tree/shaders/"
            "blender"
        )

    def test_get_working_file_name_asset(self):
        file_name = file_tree_service.get_working_file_name(
            self.task.serialize(),
            revision=3
        )
        self.assertEquals(file_name, "cosmos_landromat_props_tree_shaders_v003")

    def test_get_output_file_name_asset(self):
        file_name = file_tree_service.get_output_file_name(
            self.entity.serialize(),
            name="main",
            revision=3
        )
        self.assertEquals(
            file_name,
            "cosmos_landromat_props_tree_geometry_main_v003"
        )

    def test_get_working_file_name_shot(self):
        file_name = file_tree_service.get_working_file_name(
            self.shot_task.serialize(),
            revision=3
        )
        self.assertEquals(file_name, "cosmos_landromat_s01_p01_animation_v003")

    def test_get_working_file_path_asset(self):
        file_name = file_tree_service.get_working_file_path(
            self.task.serialize(),
            software=self.software.serialize(),
            revision=3
        )
        self.assertEquals(
            file_name,
            "/simple/productions/cosmos_landromat/assets/props/tree/shaders/"
            "blender/"
            "cosmos_landromat_props_tree_shaders_v003"
        )

    def test_get_file_path_scene(self):
        scene_task = self.generate_fixture_scene_task()
        file_name = file_tree_service.get_working_file_path(
            scene_task.serialize(),
            software=self.software_max.serialize(),
            revision=3
        )
        self.assertEquals(
            file_name,
            "/simple/productions/cosmos_landromat/scenes/s01/sc01/animation/"
            "3dsmax/"
            "cosmos_landromat_sc01_animation_v003"
        )

    def test_get_folder_path_shot_asset_instance(self):
        self.generate_fixture_shot_asset_instance(
            asset=self.entity,
            shot=self.shot
        )
        path = file_tree_service.get_instance_folder_path(
            self.asset_instance.serialize(),
            output_type=self.output_type_cache,
            task_type=self.task_type_animation.serialize(),
            representation="abc"
        )
        self.assertEquals(
            path,
            "/simple/productions/export/cosmos_landromat/shot/s01/p01/"
            "animation/cache/props/tree/instance_0001/abc"
        )

    def test_get_file_name_shot_asset_instance(self):
        self.generate_fixture_shot_asset_instance(
            asset=self.entity,
            shot=self.shot
        )
        file_name = file_tree_service.get_instance_file_name(
            self.asset_instance.serialize(),
            output_type=self.output_type_cache,
            task_type=self.task_type_animation.serialize(),
            name="main",
            revision=3
        )
        self.assertEquals(
            file_name,
            "cosmos_landromat_s01_p01_animation_cache_main" +
            "_props_tree_instance_0001_v003"
        )

    def test_get_folder_path_scene_asset_instance(self):
        self.generate_fixture_scene_asset_instance(
            asset=self.entity,
            scene=self.scene
        )
        path = file_tree_service.get_instance_folder_path(
            self.asset_instance.serialize(),
            task_type=self.task_type_animation.serialize(),
            output_type=self.output_type_cache,
            representation="abc"
        )
        self.assertEquals(
            path,
            "/simple/productions/export/cosmos_landromat/scene/s01/sc01/"
            "animation/cache/props/tree/instance_0001/abc"
        )

    def test_get_file_name_scene_asset_instance(self):
        self.generate_fixture_scene_asset_instance(
            asset=self.entity,
            scene=self.scene
        )
        file_name = file_tree_service.get_instance_file_name(
            self.asset_instance.serialize(),
            output_type=self.output_type_cache,
            task_type=self.task_type_animation.serialize(),
            name="main",
            revision=3
        )

        self.assertEquals(
            file_name,
            "cosmos_landromat_s01_sc01_animation_cache_main_props_"
            "tree_instance_0001_v003"
        )

    def test_get_folder_path_representation(self):
        self.generate_fixture_scene_asset_instance(
            asset=self.entity,
            scene=self.scene
        )
        path = file_tree_service.get_instance_folder_path(
            self.asset_instance.serialize(),
            task_type=self.task_type_animation.serialize(),
            output_type=self.output_type_cache,
            representation="abc"
        )
        self.assertEquals(
            path,
            "/simple/productions/export/cosmos_landromat/scene/s01/sc01/"
            "animation/cache/props/tree/instance_0001/abc"
        )

    def test_change_folder_path_separators(self):
        result = file_tree_service.change_folder_path_separators(
            "/simple/big_buck_bunny/props", "\\")
        self.assertEqual(result, "\\simple\\big_buck_bunny\\props")

    def test_update_variable(self):
        name = file_tree_service.update_variable(
            "<AssetType>_<Asset>",
            entity=self.entity.serialize(),
            task=self.task.serialize()
        )
        self.assertEquals(name, "props_tree")

    def test_apply_style(self):
        file_name = "Shaders"
        result = file_tree_service.apply_style(file_name, "uppercase")
        self.assertEqual(result, "SHADERS")
        result = file_tree_service.apply_style(file_name, "lowercase")
        self.assertEqual(result, "shaders")

    def test_update_variable_short_name(self):
        name = file_tree_service.update_variable(
            "<TaskType.short_name>",
            entity=self.entity.serialize(),
            task=self.task.serialize()
        )
        self.assertEquals(name, "shd")
