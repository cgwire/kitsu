from tests.base import ApiDBTestCase


from zou.app.services import tasks_service, time_spents_service


class TimeSpentsServiceTestCase(ApiDBTestCase):

    def setUp(self):
        super(TimeSpentsServiceTestCase, self).setUp()

        self.generate_fixture_person()
        self.person_id = str(self.person.id)
        self.user_id = self.user["id"]

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
        self.task_id = task_id

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
        tasks_service.create_or_update_time_spent(
            task_id, self.person_id, "2019-01-02", 850
        )

    def test_get_task(self):
        task = tasks_service.get_task(self.task_id)
        self.assertEqual(task["duration"], 3150)

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

    def test_get_week_table(self):
        week_table = time_spents_service.get_week_table("2018")
        self.assertEqual(week_table["18"][self.person_id], 600)
        self.assertEqual(week_table["22"][self.person_id], 600)
        self.assertEqual(week_table["22"][self.user_id], 600)
        self.assertEqual(week_table["23"][self.person_id], 800)
        self.assertTrue("1" not in week_table)

    def test_get_month_time_spents(self):
        tasks = time_spents_service.get_month_time_spents(
            self.person_id,
            "2018",
            "5"
        )
        self.assertEqual(len(tasks), 1)
        self.assertEqual(tasks[0]["entity_name"], "Tree")
        self.assertEqual(tasks[0]["duration"], 600)

    def test_get_week_time_spents(self):
        tasks = time_spents_service.get_week_time_spents(
            self.person_id,
            "2018",
            "18"
        )
        self.assertEqual(len(tasks), 1)
        self.assertEqual(tasks[0]["entity_name"], "Tree")
        self.assertEqual(tasks[0]["duration"], 600)

    def test_get_week_time_spents_first_week_of_the_year(self):
        tasks = time_spents_service.get_week_time_spents(
            self.person_id,
            "2019",
            "1"
        )
        self.assertEqual(len(tasks), 1)
        self.assertEqual(tasks[0]["duration"], 850)


    def test_get_day_time_spents(self):
        tasks = time_spents_service.get_day_time_spents(
            self.person_id,
            "2018",
            "5",
            "3"
        )
        self.assertEqual(len(tasks), 1)
        self.assertEqual(tasks[0]["entity_name"], "Tree")
        self.assertEqual(tasks[0]["duration"], 600)

    def test_get_time_spents(self):
        time_spents = time_spents_service.get_time_spents(
            self.person_id,
            "2018-06-04"
        )
        duration = 0
        for time_spent in time_spents:
            duration += time_spent["duration"]

        self.assertEqual(len(time_spents), 2)
        self.assertEqual(duration, 800)
