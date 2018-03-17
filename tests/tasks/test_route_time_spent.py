from tests.base import ApiDBTestCase


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

    def test_set_time_spent(self):
        data = {
            "duration": 3600
        }
        self.post(
            "/actions/tasks/%s/time-spents/2017-09-23/persons/%s" % (
                self.task.id,
                self.person.id
            ),
            data,
            200
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
        user_id = str(self.user.id)
        task_id = str(self.task.id)
        data = {"duration": 3600}
        path = "/actions/tasks/%s/time-spents/2017-09-27/persons/%s" % (
            task_id,
            person_id
        )
        self.post(path, data, 200)

        data = {"duration": 7200}
        path = "/actions/tasks/%s/time-spents/2017-09-27/persons/%s" % (
            task_id,
            user_id
        )
        self.post(path, data, 200)

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
            data,
            200
        )

        data = {"duration": 10800}
        self.post(
            "/actions/tasks/%s/time-spents/2017-09-23/persons/%s/add" % (
                task_id,
                person_id
            ),
            data,
            200
        )
        time_spents = self.get("data/time-spents")
        self.assertEquals(time_spents[0]["duration"], 14400)
        self.assertEquals(time_spents[0]["date"], "2017-09-23")
        self.assertEquals(len(time_spents), 1)
