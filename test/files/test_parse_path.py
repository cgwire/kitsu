from test.base import ApiDBTestCase

from zou.app.models.entity import Entity

from zou.app.services import file_tree


class FileTreeTestCase(ApiDBTestCase):

    def setUp(self):
        super(FileTreeTestCase, self).setUp()
        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_project_standard()
        self.generate_fixture_entity_type()
        self.generate_fixture_entity()
        self.generate_fixture_entity_standard()
        self.generate_fixture_episode()
        self.generate_fixture_sequence()
        self.generate_fixture_shot()
        self.generate_fixture_sequence_standard()
        self.generate_fixture_shot_standard()
        self.generate_fixture_person()
        self.generate_fixture_department()
        self.generate_fixture_task_type()
        self.generate_fixture_task_status()
        self.generate_fixture_assigner()
        self.generate_fixture_task()
        self.generate_fixture_task_standard()
        self.generate_fixture_shot_task()
        self.generate_fixture_shot_task_standard()
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

    def test_get_shot_path_template(self):
        tree = file_tree.get_tree_from_project(self.project.serialize())
        path = file_tree.get_shot_path_template(tree)
        self.assertEqual(
            path,
            "<Project>/shots/<Sequence>/<Shot>/<TaskType>/<Software>"
        )

    def test_get_shot_template_folders(self):
        folders = file_tree.get_shot_template_folders(self.project.serialize())
        self.assertEqual(folders, [
            u"<Project>",
            u"shots",
            u"<Sequence>",
            u"<Shot>",
            u"<TaskType>",
            u"<Software>",
        ])

    def test_get_path_folders(self):
        folders = file_tree.get_path_folders(
            self.project.serialize(),
            "/simple/productions/the_crew/shots/s01/p01/animation"
        )
        self.assertEqual(folders, [
            "the_crew",
            "shots",
            "s01",
            "p01",
            "animation"
        ])

    def test_guess_shot(self):
        shot = file_tree.guess_shot(
            self.project.serialize(), "E01", "S01", "P01"
        )
        self.assertEqual(shot.id, self.shot.id)

    def test_guess_asset(self):
        asset = file_tree.guess_asset(
            self.project.serialize(), "Props", "Tree")
        self.assertEqual(asset.id, self.entity.id)

    def test_guess_task_type(self):
        task_type = file_tree.guess_task_type("Modeling", "Shaders")
        self.assertEqual(task_type.id, self.task_type.id)

    def test_guess_task(self):
        task = file_tree.guess_task(
            self.entity,
            self.task_type,
            "Master"
        )
        self.assertEqual(task.id, self.task.id)

    def test_get_task_from_shot_path(self):
        file_path = file_tree.get_folder_path(
            self.shot_task_standard.serialize()
        )
        task = file_tree.get_shot_task_from_path(
            file_path,
            self.project_standard.serialize()
        )

        self.assertTrue(task["id"], self.shot_task_standard.id)

    def test_get_task_from_asset_path(self):
        file_path = file_tree.get_folder_path(self.task_standard.serialize())
        task = file_tree.get_asset_task_from_path(
            file_path,
            self.project_standard.serialize()
        )

        self.assertTrue(task["id"], self.shot_task_standard.id)
