from test.base import ApiDBTestCase

from zou.app.services import tasks_service


class RouteTaskChangeTestCase(ApiDBTestCase):

    def setUp(self):
        super(RouteTaskChangeTestCase, self).setUp()

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

    def test_task_assign(self):
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
        person_id = "wrong-id"
        data = {
            "person_id": person_id
        }
        self.put("/actions/tasks/%s/assign" % self.task.id, data, 400)

    def test_multiple_task_assign(self):
        task_id = str(self.task.id)
        shot_task_id = str(self.shot_task.id)
        person_id = str(self.person.id)
        data = {"task_ids": [task_id, shot_task_id]}
        self.put("/actions/persons/%s/assign" % person_id, data)

        task = tasks_service.get_task(task_id)
        self.assertEquals(len(task.assignees), 1)
        task = tasks_service.get_task(shot_task_id)
        self.assertEquals(len(task.assignees), 1)

    def test_clear_assignation(self):
        task_id = str(self.task.id)
        shot_task_id = str(self.shot_task.id)
        tasks_service.assign_task(self.task.id, self.person.id)
        tasks_service.assign_task(self.shot_task.id, self.person.id)
        data = {"task_ids": [task_id, shot_task_id]}
        self.put("/actions/tasks/clear-assignation", data)

        task = tasks_service.get_task(task_id)
        self.assertEquals(len(task.assignees), 0)
        task = tasks_service.get_task(shot_task_id)
        self.assertEquals(len(task.assignees), 0)
