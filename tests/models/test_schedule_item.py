from datetime import date, timedelta

from tests.base import ApiDBTestCase

from zou.app.models.schedule_item import ScheduleItem
from zou.app.utils import fields


class ScheduleItemTestCase(ApiDBTestCase):

    def setUp(self):
        super(ScheduleItemTestCase, self).setUp()
        self.generate_fixture_department()
        self.generate_fixture_task_type()
        self.generate_shot_suite()
        ScheduleItem.create(
            project_id=self.project.id,
            task_type_id=self.task_type.id,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=1)
        )
        ScheduleItem.create(
            project_id=self.project.id,
            task_type_id=self.task_type_animation.id,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=1)
        )
        ScheduleItem.create(
            project_id=self.project.id,
            task_type_id=self.task_type_layout.id,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=1)
        )

    def test_get_schedule_items(self):
        schedule_items = self.get("data/schedule-items")
        self.assertEqual(len(schedule_items), 3)

    def test_get_schedule_item(self):
        schedule_item = self.get_first("data/schedule-items")
        schedule_item_again = self.get(
            "data/schedule-items/%s" % schedule_item["id"])
        self.assertEqual(schedule_item, schedule_item_again)
        self.get_404("data/schedule-items/%s" % fields.gen_uuid())

    def test_create_schedule_item(self):
        data = {
            "project_id": self.project.id,
            "task_type_id": self.task_type.id,
            "start_date": date.today(),
            "end_date": date.today() + timedelta(days=1)
        }
        self.schedule_item = self.post("data/schedule-items", data)
        schedule_items = self.get("data/schedule-items")
        self.assertEqual(len(schedule_items), 4)

    def test_update_schedule_item(self):
        schedule_item = self.get_first("data/schedule-items")
        data = {
            "end_date": self.now()
        }
        self.put("data/schedule-items/%s" % schedule_item["id"], data)
        schedule_item_again = self.get(
            "data/schedule-items/%s" % schedule_item["id"])
        self.assertEqual(data["end_date"][:10], schedule_item_again["end_date"])
        self.put_404("data/schedule-items/%s" % fields.gen_uuid(), data)

    def test_delete_schedule_item(self):
        schedule_items = self.get("data/schedule-items")
        self.assertEqual(len(schedule_items), 3)
        schedule_item = schedule_items[0]
        self.delete("data/schedule-items/%s" % schedule_item["id"])
        schedule_items = self.get("data/schedule-items")
        self.assertEqual(len(schedule_items), 2)
        self.delete_404("data/schedule-items/%s" % fields.gen_uuid())
