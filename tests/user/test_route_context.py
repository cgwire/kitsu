from tests.base import ApiDBTestCase

from zou.app.services import tasks_service


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
        self.generate_fixture_task()
        self.asset_dict = self.asset.serialize(obj_type="Asset")
        self.maxDiff = None

        self.task_id = self.task.id
        self.project_closed_id = self.project_closed.id

    def assign_user(self, task_id):
        tasks_service.assign_task(task_id, self.user.id)

    def test_get_project_sequences(self):
        self.generate_fixture_shot_task()
        self.assign_user(self.shot_task.id)
        sequences = self.get(
            "data/user/projects/%s/sequences" % self.project.id
        )
        self.assertEquals(len(sequences), 1)

    def test_get_project_episodes(self):
        self.generate_fixture_shot_task()
        self.assign_user(self.shot_task.id)
        episodes = self.get(
            "data/user/projects/%s/episodes" % self.project.id
        )
        self.assertEquals(len(episodes), 1)
        self.assertEquals(episodes[0]["name"], "E01")
        self.assertEquals(episodes[0]["type"], "Episode")

    def test_get_sequence_shots(self):
        self.generate_fixture_shot_task()
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
        self.generate_fixture_shot_task()
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
        self.generate_fixture_shot_task()
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
        self.generate_fixture_shot_task()
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

        tasks_service.update_task(self.task_id, {
            "assignees": [self.user]
        })

        projects = self.get("data/user/projects/open")
        self.assertEquals(len(projects), 1)

        tasks_service.update_task(self.task_id, {
            "project_id": self.project_closed_id
        })
        projects = self.get("data/user/projects/open")
        self.assertEquals(len(projects), 0)

    def test_get_todos(self):
        self.generate_fixture_shot_task()
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

        self.assign_user(task_id)
        self.assign_user(shot_task_id)

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
