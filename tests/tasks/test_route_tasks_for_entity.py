from tests.base import ApiDBTestCase


class RouteCreateTasksTestCase(ApiDBTestCase):

    def setUp(self):
        super(RouteCreateTasksTestCase, self).setUp()

        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_entity_type()
        self.generate_fixture_sequence()
        self.generate_fixture_shot()
        self.generate_assigned_task()

    def test_get_tasks_for_task_type_and_entity(self):
        task_type_id = self.task_type.id
        task_type_animation_id = self.task_type_animation.id
        entity_id = self.entity.id

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
        tasks = self.get("/data/persons/%s/tasks" % self.person.id)
        self.assertEquals(len(tasks), 1)
        self.assertTrue(str(self.person.id) in tasks[0]["assignees"])

        tasks = self.get("/data/persons/%s/tasks" % self.user.id)
        self.assertEquals(len(tasks), 0)
