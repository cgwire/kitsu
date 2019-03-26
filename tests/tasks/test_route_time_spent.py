from tests.base import ApiDBTestCase

from zou.app.services import tasks_service


class RouteTimeSpentTestCase(ApiDBTestCase):

    def setUp(self):
        super(RouteTimeSpentTestCase, self).setUp()

        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_asset_type()
        self.generate_fixture_asset()
        self.generate_fixture_sequence()
        self.generate_fixture_shot()
        self.generate_fixture_department()
        self.generate_fixture_task_type()
        self.generate_fixture_task_status()
        self.generate_fixture_task_status_wip()
        self.generate_fixture_person()
        self.generate_fixture_assigner()
        self.generate_fixture_task()

    def create_time_spents(self):
        self.person_id = str(self.person.id)
        self.user_id = self.user["id"]

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

    def test_set_time_spent(self):
        data = {
            "duration": 3600
        }
        self.post(
            "/actions/tasks/%s/time-spents/2017-09-23/persons/%s" % (
                self.task.id,
                self.person.id
            ),
            data
        )
        time_spents = self.get("data/time-spents")
        self.assertEquals(time_spents[0]["date"], "2017-09-23")
        self.assertEquals(len(time_spents), 1)
        self.assertEquals(time_spents[0]["duration"], data["duration"])

    def test_set_time_spent_wrong_date(self):
        data = {
            "duration": 3600
        }
        self.post(
            "/actions/tasks/%s/time-spents/wrong-date/persons/%s" % (
                self.task.id,
                self.person.id
            ),
            data,
            404
        )

    def test_get_time_spent(self):
        person_id = str(self.person.id)
        user_id = str(self.user["id"])
        task_id = str(self.task.id)
        data = {"duration": 3600}
        path = "/actions/tasks/%s/time-spents/2017-09-27/persons/%s" % (
            task_id,
            person_id
        )
        self.post(path, data)

        data = {"duration": 7200}
        path = "/actions/tasks/%s/time-spents/2017-09-27/persons/%s" % (
            task_id,
            user_id
        )
        self.post(path, data)

        time_spents = self.get(
            "/actions/tasks/%s/time-spents/2017-09-23/" % task_id
        )
        self.assertEquals(time_spents["total"], 10800)
        self.assertEquals(time_spents[user_id]["duration"], 7200)
        self.assertEquals(time_spents[person_id]["duration"], 3600)

    def test_add_time_spent(self):
        person_id = str(self.person.id)
        task_id = str(self.task.id)

        data = {"duration": 3600}
        self.post(
            "/actions/tasks/%s/time-spents/2017-09-23/persons/%s" % (
                task_id,
                person_id
            ),
            data
        )

        data = {"duration": 10800}
        self.post(
            "/actions/tasks/%s/time-spents/2017-09-23/persons/%s/add" % (
                task_id,
                person_id
            ),
            data
        )
        time_spents = self.get("data/time-spents")
        self.assertEquals(time_spents[0]["duration"], 14400)
        self.assertEquals(time_spents[0]["date"], "2017-09-23")
        self.assertEquals(len(time_spents), 1)

    def test_get_month_table(self):
        self.create_time_spents()
        month_table = self.get("/data/persons/time-spents/month-table/2018")
        self.assertEqual(month_table["6"][self.person_id], 1400)
        self.assertEqual(month_table["6"][self.user_id], 600)
        self.assertTrue("1" not in month_table)

    def test_get_day_table(self):
        self.create_time_spents()
        day_table = self.get("/data/persons/time-spents/day-table/2018/06")
        self.assertEqual(day_table["3"][self.person_id], 600)
        self.assertEqual(day_table["4"][self.person_id], 800)
        self.assertEqual(day_table["3"][self.user_id], 600)
        self.assertTrue("1" not in day_table)

    def test_get_week_table(self):
        self.create_time_spents()
        week_table = self.get("/data/persons/time-spents/week-table/2018")
        self.assertEqual(week_table["18"][self.person_id], 600)
        self.assertEqual(week_table["22"][self.person_id], 600)
        self.assertEqual(week_table["22"][self.user_id], 600)
        self.assertEqual(week_table["23"][self.person_id], 800)
        self.assertTrue("1" not in week_table)

    def test_get_month_time_spents(self):
        self.create_time_spents()
        tasks = self.get(
            "/data/persons/%s/time-spents/month/2018/5" % self.person_id
        )
        self.assertEqual(len(tasks), 1)
        self.assertEqual(tasks[0]["entity_name"], "Tree")
        self.assertEqual(tasks[0]["duration"], 600)

    def test_get_week_time_spents(self):
        self.create_time_spents()
        tasks = self.get(
            "/data/persons/%s/time-spents/week/2018/18" % self.person_id
        )
        self.assertEqual(len(tasks), 1)
        self.assertEqual(tasks[0]["entity_name"], "Tree")
        self.assertEqual(tasks[0]["duration"], 600)

    def test_get_day_time_spents(self):
        self.create_time_spents()
        tasks = self.get(
            "/data/persons/%s/time-spents/day/2018/5/3" % self.person_id
        )
        self.assertEqual(len(tasks), 1)
        self.assertEqual(tasks[0]["entity_name"], "Tree")
        self.assertEqual(tasks[0]["duration"], 600)
