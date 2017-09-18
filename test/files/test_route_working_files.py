from test.base import ApiDBTestCase


class TaskLastWorkingFilesTestCase(ApiDBTestCase):

    def setUp(self):
        super(TaskLastWorkingFilesTestCase, self).setUp()

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
        self.generate_fixture_output_type()
        self.generate_fixture_output_file()
        self.maxDiff = None
        self.task_id = self.task.id

    def test_get_last_working_files(self):
        self.generate_fixture_working_file(name="main", revision=1)
        self.generate_fixture_working_file(name="main", revision=2)
        self.generate_fixture_working_file(name="main", revision=3)
        self.generate_fixture_working_file(name="main", revision=4)
        working_file_main = self.generate_fixture_working_file(
            name="main",
            revision=5
        )

        self.generate_fixture_working_file(name="hotfix", revision=1)
        self.generate_fixture_working_file(name="hotfix", revision=2)
        working_file_hotfix = self.generate_fixture_working_file(
            name="hotfix",
            revision=3
        )
        working_file_wip = self.generate_fixture_working_file(
            name="wip",
            revision=1
        )

        working_files = self.get(
            "/data/tasks/%s/last-working-files" % self.task.id
        )
        self.assertEqual(
            working_files["main"],
            working_file_main.serialize()
        )
        self.assertEqual(
            working_files["hotfix"],
            working_file_hotfix.serialize()
        )
        self.assertEqual(
            working_files["wip"],
            working_file_wip.serialize()
        )

    def test_new_working_file(self):
        path = "/data/tasks/%s/working-files/new" % self.task_id
        working_file = self.post(path, {
            "name": "main",
            "description": "description test",
            "comment": "comment test"
        })
        self.assertEqual(working_file["revision"], 1)

        path = "/data/tasks/%s/working-files/new" % self.task_id
        working_file = self.post(path, {
            "name": "main",
            "description": "description test",
            "comment": "comment test"
        })
        self.assertEqual(working_file["revision"], 2)

        working_file = self.post(path, {
            "name": "main",
            "description": "description test",
            "comment": "comment test"
        })
        self.assertEqual(working_file["revision"], 3)
        self.assertEqual(
            working_file["path"],
            "/simple/productions/cosmos_landromat/assets/props/tree/shaders/"
            "3ds_max/cosmos_landromat_props_tree_shaders_main_v003"
        )

    def test_update_modification_date(self):
        path = "/actions/working-files/%s/modified" % self.working_file.id
        previous_date = self.working_file.serialize()["updated_at"]
        working_file = self.put(path, {})
        current_date = working_file["updated_at"]
        self.assertTrue(previous_date < current_date)

        now = fields.serialize_value(datetime.datetime.utcnow())
        self.assertTrue(current_date < now)
