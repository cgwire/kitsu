from tests.base import ApiDBTestCase

from zou.app.services import schedule_service


class ScheduleServiceTestCase(ApiDBTestCase):

    def setUp(self):
        super(ScheduleServiceTestCase, self).setUp()
        self.generate_shot_suite()
        self.generate_assigned_task()
        self.project_id = str(self.project.id)
        self.task_type_id = str(self.task_type.id)
        self.sequence_id = str(self.sequence.id)
        self.episode_id = str(self.episode.id)
        self.asset_type_id = str(self.asset_type.id)

    def test_get_schedule_items(self):
        items = schedule_service.get_task_types_schedule_items(self.project.id)
        self.assertEqual(len(items), 1)
        self.generate_fixture_shot_task()
        items = schedule_service.get_task_types_schedule_items(self.project.id)
        self.assertEqual(len(items), 2)
        task_type_ids = [item["task_type_id"] for item in items]
        self.assertTrue(str(self.task_type.id) in task_type_ids)
        self.assertTrue(str(self.task_type_animation.id) in task_type_ids)

        self.shot_task.delete()
        items = schedule_service.get_task_types_schedule_items(self.project.id)
        self.assertEqual(len(items), 1)

    def test_get_schedule_sequence_items(self):
        items = schedule_service.get_sequences_schedule_items(
            self.project.id,
            self.task_type_id
        )
        self.assertEqual(len(items), 1)
        self.assertEqual(items[0]["object_id"], self.sequence_id)
        self.assertEqual(items[0]["task_type_id"], self.task_type_id)
        self.assertEqual(items[0]["project_id"], self.project_id)

    def test_get_schedule_episode_items(self):
        items = schedule_service.get_episodes_schedule_items(
            self.project.id,
            self.task_type_id
        )
        self.assertEqual(items[0]["object_id"], self.episode_id)
        self.assertEqual(items[0]["task_type_id"], self.task_type_id)
        self.assertEqual(items[0]["project_id"], self.project_id)

    def test_get_schedule_asset_type_items(self):
        items = schedule_service.get_asset_types_schedule_items(
            self.project.id,
            self.task_type_id
        )
        self.assertEqual(items[0]["object_id"], self.asset_type_id)
        self.assertEqual(items[0]["task_type_id"], self.task_type_id)
        self.assertEqual(items[0]["project_id"], self.project_id)
