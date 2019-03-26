from tests.base import ApiDBTestCase

from zou.app.services import tasks_service, notifications_service

from zou.app.models.project import Project
from zou.app.models.person import Person


class UserContextRoutesTestCase(ApiDBTestCase):

    def setUp(self):
        super(UserContextRoutesTestCase, self).setUp()
        self.generate_fixture_project_status()
        self.generate_fixture_project_closed_status()
        self.generate_fixture_project()
        self.generate_fixture_person()
        self.generate_fixture_project_closed()
        self.generate_fixture_asset_type()
        self.generate_fixture_asset()
        self.generate_fixture_episode()
        self.generate_fixture_sequence()
        self.generate_fixture_shot()
        self.generate_fixture_department()
        self.generate_fixture_task_type()
        self.generate_fixture_task_status()
        self.generate_fixture_assigner()

        self.project_id = self.project.id

        self.task_dict = self.generate_fixture_task().serialize()
        self.task_id = self.task.id
        self.sequence_dict = self.sequence.serialize()

        self.shot_task_dict = self.generate_fixture_shot_task().serialize()
        self.task_type_dict = self.task_type_animation.serialize()
        self.shot_task_id = self.task.id

        self.asset_dict = self.asset.serialize(obj_type="Asset")
        self.maxDiff = None

        self.project_closed_id = self.project_closed.id
        self.user_id = self.user["id"]

    def assign_user(self, task_id):
        tasks_service.assign_task(task_id, self.user_id)
        project = Project.get(self.project_id)
        person = Person.get(self.user_id)
        project.team.append(person)
        project.save()

    def test_get_project_sequences(self):
        self.assign_user(self.shot_task.id)
        sequences = self.get(
            "data/user/projects/%s/sequences" % self.project.id
        )
        self.assertEquals(len(sequences), 1)

    def test_get_project_episodes(self):
        self.assign_user(self.shot_task.id)
        episodes = self.get(
            "data/user/projects/%s/episodes" % self.project.id
        )
        self.assertEquals(len(episodes), 1)
        self.assertEquals(episodes[0]["name"], "E01")
        self.assertEquals(episodes[0]["type"], "Episode")

    def test_get_sequence_shots(self):
        self.assign_user(self.shot_task.id)
        shots = self.get("data/user/sequences/%s/shots" % self.sequence.id)
        self.assertEquals(len(shots), 1)
        self.assertEquals(shots[0]["type"], "Shot")
        self.assertEquals(shots[0]["name"], "P01")

    def test_get_sequence_scenes(self):
        self.generate_fixture_scene()
        self.generate_fixture_scene_task()
        self.assign_user(self.scene_task.id)
        scenes = self.get("data/user/sequences/%s/scenes" % self.sequence.id)
        self.assertEquals(len(scenes), 1)
        self.assertEquals(scenes[0]["type"], "Scene")
        self.assertEquals(scenes[0]["name"], "SC01")

    def test_get_project_asset_types(self):
        task_id = self.task.id
        shot_task_id = self.shot_task.id
        self.generate_fixture_asset_types()
        self.generate_fixture_asset_character()
        self.generate_fixture_task("main", self.asset_character.id)
        task2_id = self.task.id
        self.generate_fixture_task("second", self.asset_character.id)
        task3_id = self.task.id

        asset_types = self.get(
            "data/user/projects/%s/asset-types" % self.project.id
        )
        self.assertEquals(len(asset_types), 0)

        self.assign_user(task_id)
        self.assign_user(task2_id)
        self.assign_user(task3_id)
        self.assign_user(shot_task_id)
        asset_types = self.get(
            "data/user/projects/%s/asset-types" % self.project.id
        )
        self.assertEquals(len(asset_types), 2)

    def test_get_project_asset_types_assets(self):
        task_id = self.task.id
        assets = self.get(
            "data/user/projects/%s/asset-types/%s/assets" % (
                self.project.id,
                self.asset_type.id
            )
        )
        self.assertEquals(len(assets), 0)
        self.assign_user(task_id)

        assets = self.get(
            "data/user/projects/%s/asset-types/%s/assets" % (
                self.project.id,
                self.asset_type.id
            )
        )
        self.assertEquals(len(assets), 1)

    def test_get_asset_tasks(self):
        path = "data/user/assets/%s/tasks" % self.asset.id
        task_id = self.task.id

        tasks = self.get(path)
        self.assertEquals(len(tasks), 0)

        self.assign_user(task_id)
        tasks = self.get(path)
        self.assertEquals(len(tasks), 1)

    def test_get_shot_tasks(self):
        path = "data/user/shots/%s/tasks" % self.shot.id
        shot_task_id = self.shot_task.id

        tasks = self.get(path)
        self.assertEquals(len(tasks), 0)

        self.assign_user(shot_task_id)
        tasks = self.get(path)
        self.assertEquals(len(tasks), 1)

    def test_get_scene_tasks(self):
        self.generate_fixture_scene()
        self.generate_fixture_scene_task()
        scene_task_id = self.scene_task.id
        path = "data/user/scenes/%s/tasks" % self.scene.id

        tasks = self.get(path)
        self.assertEquals(len(tasks), 0)

        self.assign_user(scene_task_id)
        tasks = self.get(path)
        self.assertEquals(len(tasks), 1)

    def test_get_asset_task_types(self):
        path = "data/user/assets/%s/task-types" % self.asset.id
        task_id = self.task.id
        task_type_id = self.task_type.id

        task_types = self.get(path)
        self.assertEquals(len(task_types), 0)

        self.assign_user(task_id)
        task_types = self.get(path)
        self.assertEquals(len(task_types), 1)
        self.assertEquals(task_types[0]["id"], str(task_type_id))

    def test_get_shot_task_types(self):
        path = "data/user/shots/%s/task-types" % self.shot.id
        shot_task_id = self.shot_task.id

        task_types = self.get(path)
        self.assertEquals(len(task_types), 0)

        self.assign_user(shot_task_id)
        task_types = self.get(path)
        self.assertEquals(len(task_types), 1)

    def test_get_scene_task_types(self):
        self.generate_fixture_scene()
        self.generate_fixture_scene_task()
        path = "data/user/scenes/%s/task-types" % self.scene.id
        scene_task_id = self.scene_task.id

        task_types = self.get(path)
        self.assertEquals(len(task_types), 0)

        self.assign_user(scene_task_id)
        task_types = self.get(path)
        self.assertEquals(len(task_types), 1)

    def test_get_open_projects(self):
        projects = self.get("data/user/projects/open")
        self.assertEquals(len(projects), 0)

        project = Project.get(self.project_id)
        person = Person.get(self.user_id)
        project.team.append(person)
        project.save()

        projects = self.get("data/user/projects/open")
        self.assertEquals(len(projects), 1)

        project = Project.get(self.project_id)
        project.team[:] = []
        project.save()

        projects = self.get("data/user/projects/open")
        self.assertEquals(len(projects), 0)

    def test_get_todos(self):
        task_id = self.task.id
        shot_task_id = self.shot_task.id

        path = "data/user/tasks/"
        tasks = self.get(path)
        self.assertEquals(len(tasks), 0)

        self.assign_user(task_id)
        self.assign_user(shot_task_id)

        path = "data/user/tasks/"
        tasks = self.get(path)
        self.assertEquals(len(tasks), 2)

        tasks_service.update_task(shot_task_id, {
            "task_status_id": tasks_service.get_done_status()["id"]
        })

        path = "data/user/tasks/"
        tasks = self.get(path)
        self.assertEquals(len(tasks), 1)

    def test_get_done_tasks(self):
        task_id = self.task.id

        path = "data/user/done-tasks/"
        tasks = self.get(path)
        self.assertEquals(len(tasks), 0)

        self.assign_user(task_id)

        path = "data/user/done-tasks/"
        tasks = self.get(path)
        self.assertEquals(len(tasks), 0)

        done_status = tasks_service.get_done_status()
        tasks_service.update_task(task_id, {
            "task_status_id": done_status["id"]
        })

        path = "data/user/done-tasks/"
        tasks = self.get(path)
        self.assertEquals(len(tasks), 1)

    def test_get_filters(self):
        project_id = str(self.project.id)
        path = "data/user/filters/"
        filter_1 = {
            "list_type": "asset",
            "name": "props",
            "query": "props",
            "project_id": project_id
        }
        filter_2 = {
            "list_type": "shot",
            "name": "se01",
            "query": "se01",
            "project_id": project_id
        }
        filter_3 = {
            "list_type": "all",
            "name": "wfa",
            "query": "wfa",
            "project_id": project_id
        }
        self.post(path, filter_1)
        self.post(path, filter_2)
        self.post(path, filter_3)

        result = self.get(path)
        self.assertTrue("asset" in result)
        self.assertTrue("shot" in result)
        self.assertTrue("all" in result)
        self.assertEqual(len(result["asset"][project_id]), 1)
        self.assertEqual(len(result["shot"][project_id]), 1)
        self.assertEqual(len(result["all"][project_id]), 1)
        self.assertEqual(
            result["all"][project_id][0]["search_query"], "wfa")
        self.assertEqual(
            result["asset"][project_id][0]["search_query"], "props")
        self.assertEqual(
            result["shot"][project_id][0]["search_query"], "se01")

    def test_remove_filter(self):
        project_id = str(self.project.id)
        path = "data/user/filters"
        filter_1 = {
            "list_type": "asset",
            "name": "props",
            "query": "props",
            "project_id": project_id
        }
        search_filter = self.post(path, filter_1)
        result = self.get(path)
        self.assertTrue("asset" in result)

        self.delete("%s/%s" % (path, search_filter["id"]))

        result = self.get(path)
        self.assertFalse("asset" in result)

    def test_add_logs(self):
        path = "/data/user/desktop-login-logs"

        date_1 = self.now()
        data = {"date": date_1}
        logs = self.get(path)
        self.assertEqual(len(logs), 0)

        self.post(path, data)
        date_2 = self.now()
        data = {"date": date_2}
        self.post(path, data)

        logs = self.get(path)
        self.assertEqual(len(logs), 2)
        self.assertEqual(logs[0]["person_id"], str(self.user_id))
        self.assertEqual(logs[0]["date"], date_2)

    def test_get_notifications(self):
        person_id = str(self.person.id)
        tasks_service.assign_task(self.task.id, self.user_id)
        self.generate_fixture_comment()
        notifications_service.create_notifications_for_task_and_comment(
            self.task_dict,
            self.comment
        )
        path = "/data/user/notifications"
        notifications = self.get(path)
        self.assertEqual(len(notifications), 1)
        self.assertEqual(notifications[0]["author_id"], person_id)

    def test_get_notification(self):
        tasks_service.assign_task(self.task.id, self.user_id)
        self.generate_fixture_comment()
        notifications_service.create_notifications_for_task_and_comment(
            self.task_dict,
            self.comment
        )
        path = "/data/user/notifications"
        notifications = self.get(path)
        notification = notifications[0]
        path = "/data/user/notifications/%s" % notification["id"]
        notification_again = self.get(path)
        self.assertEqual(notification_again["id"], notification["id"])
        self.assertEqual(notification_again["full_entity_name"], "Props / Tree")

    def test_subscribe_task(self):
        recipients = notifications_service.get_notification_recipients(
            self.task_dict
        )
        self.assertFalse(self.user_id in recipients)

        self.post("/actions/user/tasks/%s/subscribe" % self.task_dict["id"], {})
        recipients = notifications_service.get_notification_recipients(
            self.task_dict
        )
        self.assertTrue(self.user_id in recipients)

    def test_unsubscribe_task(self):
        self.post("/actions/user/tasks/%s/subscribe" % self.task_dict["id"], {})
        self.delete("/actions/user/tasks/%s/unsubscribe" % self.task_dict["id"])
        recipients = notifications_service.get_notification_recipients(
            self.task_dict
        )
        self.assertFalse(self.user_id in recipients)

    def test_subscribe_sequence(self):
        recipients = notifications_service.get_notification_recipients(
            self.shot_task_dict
        )
        self.assertFalse(self.user_id in recipients)

        path = "/actions/user/sequences/%s/task-types/%s/subscribe" % (
            self.sequence_dict["id"],
            self.task_type_dict["id"]
        )
        print(path)
        self.post(path, {})

        recipients = notifications_service.get_notification_recipients(
            self.shot_task_dict
        )
        self.assertTrue(self.user_id in recipients)

    def test_unsubscribe_sequence(self):
        path = "/actions/user/sequences/%s/task-types/%s/" % (
            self.sequence_dict["id"],
            self.task_type_dict["id"]
        )
        self.post(path + "subscribe", {})
        self.delete(path + "unsubscribe")
        recipients = notifications_service.get_notification_recipients(
            self.shot_task_dict
        )
        self.assertFalse(self.user_id in recipients)
