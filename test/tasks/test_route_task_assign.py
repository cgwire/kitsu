from test.base import ApiDBTestCase


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

    def test_task_assign(self):
        person_id = str(self.person.id)
        data = {
            "person_id": person_id
        }
        self.put("data/tasks/%s/assign" % self.task.id, data, 200)
        task = self.get("data/tasks/%s" % self.task.id)

        self.assertEqual(task["assignees"][0], person_id)

    def test_task_assign_404(self):
        person_id = str(self.person.id)
        data = {
            "person_id": person_id
        }
        self.put("data/tasks/%s/assign" % "wrong-id", data, 404)

    def test_task_assign_400(self):
        person_id = "wrong-id"
        data = {
            "person_id": person_id
        }
        self.put("data/tasks/%s/assign" % self.task.id, data, 400)
