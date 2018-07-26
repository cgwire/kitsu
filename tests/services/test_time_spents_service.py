from tests.base import ApiDBTestCase

from zou.app.services import tasks_service, time_spents_service


class TimeSpentsServiceTestCase(ApiDBTestCase):

    def setUp(self):
        super(TimeSpentsServiceTestCase, self).setUp()

        self.generate_fixture_person()
        self.person_id = str(self.person.id)
        self.user_id = str(self.user.id)

        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_asset_type()
        self.generate_fixture_asset()
        self.generate_fixture_department()
        self.generate_fixture_task_type()
        self.generate_fixture_task_status()
        self.generate_fixture_assigner()

        self.generate_fixture_task()
        task_id = str(self.task.id)

        self.generate_fixture_sequence()
        self.generate_fixture_shot()
        self.generate_fixture_shot_task()
        shot_task_id = str(self.shot_task.id)

        tasks_service.create_or_update_time_spent(
            task_id, self.person_id, "2018-06-04", 500
        )
        tasks_service.create_or_update_time_spent(
            shot_task_id, self.person_id, "2018-06-04", 300
        )
        tasks_service.create_or_update_time_spent(
            task_id, self.person_id, "2018-06-03", 600
        )
        tasks_service.create_or_update_time_spent(
            task_id, self.person_id, "2018-05-03", 600
        )
        tasks_service.create_or_update_time_spent(
            task_id, self.person_id, "2018-05-03", 600
        )
        tasks_service.create_or_update_time_spent(
            task_id, self.user_id, "2018-06-03", 600
        )

    def test_get_month_table(self):
        month_table = time_spents_service.get_month_table("2018")
        self.assertEqual(month_table["6"][self.person_id], 1400)
        self.assertEqual(month_table["6"][self.user_id], 600)
        self.assertTrue("1" not in month_table)

    def test_get_day_table(self):
        day_table = time_spents_service.get_day_table("2018", "06")
        self.assertEqual(day_table["3"][self.person_id], 600)
        self.assertEqual(day_table["4"][self.person_id], 800)
        self.assertEqual(day_table["3"][self.user_id], 600)
        self.assertTrue("1" not in day_table)
