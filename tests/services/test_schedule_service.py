from tests.base import ApiDBTestCase

from zou.app.services import schedule_service


class ScheduleServiceTestCase(ApiDBTestCase):

    def setUp(self):
        super(ScheduleServiceTestCase, self).setUp()
        self.generate_shot_suite()
        self.generate_assigned_task()

    def test_get_schedule_items(self):
        items = schedule_service.get_schedule_items(self.project.id)
        self.assertEquals(len(items), 1)
        self.generate_fixture_shot_task()
        items = schedule_service.get_schedule_items(self.project.id)
        self.assertEquals(len(items), 2)
        task_type_ids = [item["task_type_id"] for item in items]
        self.assertTrue(str(self.task_type.id) in task_type_ids)
        self.assertTrue(str(self.task_type_animation.id) in task_type_ids)

        self.shot_task.delete()
        items = schedule_service.get_schedule_items(self.project.id)
        self.assertEquals(len(items), 1)
