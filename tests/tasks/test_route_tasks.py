from tests.base import ApiDBTestCase

from zou.app.services import tasks_service


class TaskRoutesTestCase(ApiDBTestCase):

    def setUp(self):
        super(TaskRoutesTestCase, self).setUp()

        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_asset_type()
        self.generate_fixture_asset()
        self.generate_fixture_sequence()
        self.generate_fixture_shot()
        self.generate_fixture_department()
        self.generate_fixture_task_type()
        self.generate_fixture_task_status()
        self.generate_fixture_person()
        self.generate_fixture_assigner()
        self.generate_fixture_task_status_wip()
        self.todo_status = tasks_service.get_or_create_status("Todo")
        self.asset_id = str(self.asset.id)
        self.shot_id = str(self.shot.id)
        self.task_type_id = str(self.task_type.id)

        self.wip_status_id = self.task_status_wip.id
        self.person_id = self.person.id

    def test_create_asset_tasks(self):
        path = "/actions/task-types/%s/assets/create-tasks" % self.task_type_id
        tasks = self.post(path, {})
        self.assertEqual(len(tasks), 1)

        tasks = self.get("/data/tasks")
        self.assertEqual(len(tasks), 1)
        task = tasks[0]
        self.assertEqual(task["name"], "main")
        self.assertEqual(task["task_type_id"], self.task_type_id)
        self.assertEqual(task["entity_id"], self.asset_id)

    def test_create_shot_tasks(self):
        path = "/actions/task-types/%s/shots/create-tasks" % self.task_type_id
        tasks = self.post(path, {})
        self.assertEqual(len(tasks), 1)

        tasks = self.get("/data/tasks")
        self.assertEqual(len(tasks), 1)
        task = tasks[0]
        self.assertEqual(task["name"], "main")
        self.assertEqual(task["task_type_id"], self.task_type_id)
        self.assertEqual(task["entity_id"], self.shot_id)

    def test_task_assign(self):
        self.generate_fixture_task()
        person_id = str(self.person.id)
        data = {
            "person_id": person_id
        }
        self.put("/actions/tasks/%s/assign" % self.task.id, data, 200)
        task = self.get("data/tasks/%s" % self.task.id)
        self.assertEqual(task["assignees"][0], person_id)

    def test_task_assign_404(self):
        person_id = str(self.person.id)
        data = {
            "person_id": person_id
        }
        self.put("/actions/tasks/%s/assign" % "wrong-id", data, 404)

    def test_task_assign_400(self):
        self.generate_fixture_task()
        person_id = "wrong-id"
        data = {
            "person_id": person_id
        }
        self.put("/actions/tasks/%s/assign" % self.task.id, data, 400)

    def test_multiple_task_assign(self):
        self.generate_fixture_task()
        self.generate_fixture_shot_task()
        task_id = str(self.task.id)
        shot_task_id = str(self.shot_task.id)
        person_id = str(self.person.id)
        data = {"task_ids": [task_id, shot_task_id]}
        self.put("/actions/persons/%s/assign" % person_id, data)

        task = tasks_service.get_task(task_id)
        self.assertEquals(len(task["assignees"]), 1)
        task = tasks_service.get_task(shot_task_id)
        self.assertEquals(len(task["assignees"]), 1)

    def test_clear_assignation(self):
        self.generate_fixture_task()
        self.generate_fixture_shot_task()
        task_id = str(self.task.id)
        shot_task_id = str(self.shot_task.id)
        tasks_service.assign_task(self.task.id, self.person.id)
        tasks_service.assign_task(self.shot_task.id, self.person.id)
        data = {"task_ids": [task_id, shot_task_id]}
        self.put("/actions/tasks/clear-assignation", data)

        task = tasks_service.get_task(task_id)
        self.assertEquals(len(task["assignees"]), 0)
        task = tasks_service.get_task(shot_task_id)
        self.assertEquals(len(task["assignees"]), 0)

    def test_comment_task(self):
        self.generate_fixture_task()
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
        self.generate_fixture_task()

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

    def test_get_tasks_for_task_type_and_entity(self):
        self.generate_fixture_task()
        task_type_id = self.task_type.id
        task_type_animation_id = self.task_type_animation.id
        entity_id = self.asset.id

        tasks = self.get("/data/entities/%s/task-types/%s/tasks" % (
            entity_id,
            task_type_id
        ))
        self.assertEquals(len(tasks), 1)
        self.assertDictEqual(tasks[0], self.task.serialize())

        tasks = self.get("/data/entities/%s/task-types/%s/tasks" % (
            entity_id,
            task_type_animation_id
        ))
        self.assertEquals(len(tasks), 0)

    def test_get_tasks_for_person(self):
        self.generate_fixture_task()
        tasks_service.create_comment(
            self.task.id,
            self.task_status.id,
            self.person.id,
            "first comment"
        )
        tasks_service.create_comment(
            self.task.id,
            self.task_status.id,
            self.person.id,
            "last comment"
        )
        tasks = self.get("/data/persons/%s/tasks" % self.person.id)
        self.assertEqual(len(tasks), 1)
        self.assertEqual(tasks[0]["last_comment"]["text"], "last comment")
        self.assertEqual(
            tasks[0]["last_comment"]["person_id"],
            str(self.person.id)
        )
        self.assertEquals(len(tasks), 1)
        self.assertTrue(str(self.person.id) in tasks[0]["assignees"])

        tasks = self.get("/data/persons/%s/tasks" % self.user.id)
        self.assertEquals(len(tasks), 0)

    def test_get_done_tasks_for_person(self):
        self.generate_fixture_task()
        self.task_id = self.task.id
        tasks = self.get("/data/persons/%s/done-tasks" % self.person.id)
        self.assertEqual(len(tasks), 0)

        done_status = tasks_service.get_done_status()
        tasks_service.update_task(self.task_id, {
            "task_status_id": done_status["id"]
        })

        tasks = self.get("/data/persons/%s/done-tasks" % self.person.id)
        self.assertEquals(len(tasks), 1)
