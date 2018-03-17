from tests.base import ApiDBTestCase


class RouteTaskChangeTestCase(ApiDBTestCase):

    def setUp(self):
        super(RouteTaskChangeTestCase, self).setUp()

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

        self.wip_status_id = self.task_status_wip.id
        self.person_id = self.person.id

    def test_comment_task(self):
        path = "/actions/tasks/%s/comment/" % self.task.id
        data = {
            "task_status_id": self.wip_status_id,
            "comment": "comment test"
        }
        comment = self.post(path, data)
        self.assertEqual(comment["text"], data["comment"])
        self.assertEqual(
            comment["person"]["first_name"],
            str(self.user.first_name)
        )
        self.assertEqual(comment["task_status"]["short_name"], "wip")

        tasks = self.get("/data/tasks")
        self.assertEqual(len(tasks), 1)
        self.assertEqual(tasks[0]["task_status_id"], str(self.wip_status_id))

        comments = self.get("/data/comments/")
        self.assertEqual(len(comments), 1)
        self.assertEqual(comments[0]["text"], data["comment"])
        self.assertEqual(comments[0]["person_id"], str(self.user.id))

    def test_task_comments(self):
        self.generate_fixture_project_standard()
        self.generate_fixture_asset_standard()
        self.generate_fixture_task_standard()

        self.task_id = str(self.task.id)
        self.task_2_id = str(self.task_standard.id)

        path = "/actions/tasks/%s/comment/" % self.task_id
        data = {
            "task_status_id": self.wip_status_id,
            "comment": "comment test"
        }
        self.post(path, data)
        data = {
            "task_status_id": self.wip_status_id,
            "comment": "comment test 2"
        }
        self.post(path, data)

        path = "/actions/tasks/%s/comment/" % self.task_2_id
        self.post(path, data)

        path = "/data/tasks/%s/comments/" % self.task_id
        comments = self.get(path)
        self.assertEqual(len(comments), 2)
        self.assertEqual(comments[0]["text"], data["comment"])
        self.assertEqual(
            comments[0]["person"]["first_name"],
            str(self.user.first_name)
        )
        self.assertEqual(comments[0]["task_status"]["short_name"], "wip")

        path = "/actions/tasks/unknown/comments/"
        comments = self.get(path, 404)
