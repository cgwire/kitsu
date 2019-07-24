from tests.base import ApiDBTestCase


class ProjectScheduleRouteTestCase(ApiDBTestCase):

    def setUp(self):
        super(ProjectScheduleRouteTestCase, self).setUp()

        self.generate_shot_suite()
        self.generate_assigned_task()
        self.generate_fixture_shot_task()
        self.project_id = str(self.project.id)
        self.task_type_id = str(self.task_type.id)
        self.task_type_animation_id = str(self.task_type_animation.id)

    def test_get_schedule_items(self):
        path = "/data/projects/%s/schedule-items" % self.project_id
        items = self.get(path)
        self.assertEqual(len(items), 2)
        task_type_ids = [item["task_type_id"] for item in items]
        self.assertTrue(str(self.task_type_id) in task_type_ids)
        self.assertTrue(str(self.task_type_animation_id) in task_type_ids)
