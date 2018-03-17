from tests.base import ApiDBTestCase

from zou.app.models.time_spent import TimeSpent

from zou.app.utils import fields


class TimeSpentTestCase(ApiDBTestCase):

    def setUp(self):
        super(TimeSpentTestCase, self).setUp()

        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_asset_type()
        self.generate_fixture_asset()
        self.generate_fixture_person()
        self.generate_fixture_department()
        self.generate_fixture_task_type()
        self.generate_fixture_task_status()
        self.generate_fixture_assigner()
        self.generate_fixture_task()
        self.tasks = self.generate_data(
            TimeSpent,
            3,
            task_id=self.task.id,
            person_id=self.person.id
        )

    def test_get_time_spents(self):
        time_spents = self.get("data/time-spents")
        self.assertEquals(len(time_spents), 3)
        self.assertEquals(time_spents[0]["type"], "TimeSpent")

    def test_get_time_spent(self):
        time_spent = self.get_first("data/time-spents")
        time_spent_again = self.get("data/time-spents/%s" % time_spent["id"])
        self.assertEquals(time_spent, time_spent_again)
        self.get_404("data/time-spents/%s" % fields.gen_uuid())

    def test_create_time_spent(self):
        data = {
            "person_id": self.person.id,
            "task_id": self.task.id,
            "date": "2017-09-23",
            "duration": 3600
        }
        self.time_spent = self.post("data/time-spents", data)
        self.assertIsNotNone(self.time_spent["id"])

        time_spents = self.get("data/time-spents")
        self.assertEquals(len(time_spents), 4)

    def test_update_time_spent(self):
        time_spent = self.get_first("data/time-spents")
        data = {
            "duration": 7200
        }
        self.put("data/time-spents/%s" % time_spent["id"], data)
        time_spent_again = self.get("data/time-spents/%s" % time_spent["id"])
        self.assertEquals(data["duration"], time_spent_again["duration"])
        self.put_404("data/time-spents/%s" % fields.gen_uuid(), data)

    def test_delete_time_spent(self):
        time_spents = self.get("data/time-spents")
        self.assertEquals(len(time_spents), 3)

        time_spent = time_spents[0]
        self.delete("data/time-spents/%s" % time_spent["id"])

        time_spents = self.get("data/time-spents")
        self.assertEquals(len(time_spents), 2)
        self.delete_404("data/time-spents/%s" % fields.gen_uuid())
