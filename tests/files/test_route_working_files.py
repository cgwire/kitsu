import time

from tests.base import ApiDBTestCase

from zou.app.models.task import Task
from zou.app.services import projects_service


class WorkingFilesTestCase(ApiDBTestCase):

    def setUp(self):
        super(WorkingFilesTestCase, self).setUp()

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
            "/data/tasks/%s/working-files/last-revisions" % self.task.id
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
        task = Task.get(self.task_id)
        self.assertEquals(len(task.assignees), 1)
        self.assertNotEquals(self.user["id"], str(task.assignees[0].id))

        path = "/data/tasks/%s/working-files/new" % self.task_id
        working_file = self.post(path, {
            "name": "main",
            "description": "description test",
            "comment": "comment test"
        })
        self.assertEqual(working_file["revision"], 1)
        task = Task.get(self.task_id)

        assignees = [person.serialize() for person in task.assignees]
        assignees = sorted(assignees, key=lambda x: x["last_name"])

        self.assertEquals(self.user["id"], assignees[0]["id"])

        task = Task.get(self.task_id)
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

        working_file = self.post(path, {
            "name": "main",
            "description": "description test",
            "comment": "comment test",
            "revision": 66
        })
        self.assertEqual(working_file["revision"], 66)
        self.assertEqual(
            working_file["path"],
            "/simple/productions/cosmos_landromat/assets/props/tree/shaders/"
            "3ds_max/cosmos_landromat_props_tree_shaders_main_v066"
        )

    def test_create_same_working_file(self):
        path = "/data/tasks/%s/working-files/new" % self.task_id
        self.post(path, {
            "name": "main",
            "description": "description test",
            "comment": "comment test",
            "revision": 66
        })
        self.post(path, {
            "name": "main",
            "description": "description test",
            "comment": "comment test",
            "revision": 66
        }, 400)

    def test_update_modification_date(self):
        path = "/actions/working-files/%s/modified" % self.working_file.id
        previous_date = self.working_file.serialize()["updated_at"]
        time.sleep(1)
        working_file = self.put(path, {})
        current_date = working_file["updated_at"]
        self.assertTrue(previous_date < current_date)

        time.sleep(1)
        now = self.now()
        self.assertTrue(current_date < now)

    def test_get_untyped_file(self):
        working_file_id = str(self.working_file.id)
        output_file_id = str(self.output_file.id)

        path = "/data/files/%s" % working_file_id
        remote_file = self.get(path)
        self.assertEquals(remote_file["id"], working_file_id)
        self.assertEquals(remote_file["type"], "WorkingFile")

        path = "/data/files/%s" % output_file_id
        remote_file = self.get(path)
        self.assertEquals(remote_file["id"], output_file_id)
        self.assertEquals(remote_file["type"], "OutputFile")

        path = "/data/files/%s" % self.task_id
        self.get(path, 404)

        self.generate_fixture_user_cg_artist()
        self.log_in_cg_artist()
        path = "/data/files/%s" % output_file_id
        self.get(path, 403)
        projects_service.add_team_member(
            self.project_id,
            self.user_cg_artist["id"]
        )
        self.get(path)

    def test_comment_working_file(self):
        comment_data = {
            "comment": "test working file comment"
        }
        self.put(
            "/actions/working-files/%s/comment" % self.working_file.id,
            comment_data
        )
        working_file = self.get("data/working-files/%s" % self.working_file.id)
        self.assertEqual(working_file["comment"], comment_data["comment"])

    def test_update_working_file_permission(self):
        working_file = self.working_file.serialize()
        self.generate_fixture_user_cg_artist()
        user = self.user_cg_artist
        self.log_in_cg_artist()
        comment_data = {
            "comment": "test working file comment"
        }

        self.put(
            "/actions/working-files/%s/comment" % working_file["id"],
            comment_data,
            403
        )
        projects_service.add_team_member(self.project_id, user["id"])
        self.put(
            "/actions/working-files/%s/comment" % working_file["id"],
            comment_data
        )
        working_file = self.get("data/working-files/%s" % working_file["id"])
        self.assertEqual(working_file["comment"], comment_data["comment"])

    def test_comment_working_wrong_data(self):
        comment_data = {
            "comment_wrong": "test working file comment"
        }
        self.put(
            "/actions/working-files/%s/comment" % self.working_file.id,
            comment_data,
            400
        )
