import datetime

from tests.base import ApiDBTestCase


class DesktopLoginLogsTestCase(ApiDBTestCase):

    def setUp(self):
        super(DesktopLoginLogsTestCase, self).setUp()
        self.person = self.generate_fixture_person().serialize()
        self.path = "/data/persons/%s/desktop-login-logs" % self.person["id"]

    def test_add_logs(self):
        date_1 = self.now()
        data = {"date": date_1}
        logs = self.get(self.path)
        self.assertEqual(len(logs), 0)

        self.post(self.path, data)
        date_2 = self.now()
        data = {"date": date_2}
        self.post(self.path, data)
        logs = self.get(self.path)
        self.assertEqual(len(logs), 2)
        self.assertEqual(logs[0]["person_id"], self.person["id"])
        self.assertEqual(logs[0]["date"], date_2)

    def test_get_csv(self):
        data = {"date": datetime.datetime(2018, 4, 1, 0, 0, 0).isoformat()}
        self.path = \
            "/data/persons/%s/desktop-login-logs" % self.person["id"]
        self.post(self.path, data)

        data = {"date": datetime.datetime(2018, 4, 10, 0, 0, 0).isoformat()}
        self.path = \
            "/data/persons/%s/desktop-login-logs" % self.person["id"]
        self.post(self.path, data)

        csv = self.get_raw("/data/persons/presence-logs/2018-04")
        expected_csv = [
            "2018;1;2;3;4;5;6;7;8;9;10;11;12;13;14;15;16;17;18;"
            "19;20;21;22;23;24;25;26;27;28;29;30",
            "John Did;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;",
            "John Doe;X;;;;;;;;;X;;;;;;;;;;;;;;;;;;;;",
            ""
        ]
        self.assertListEqual(expected_csv, csv.split("\r\n"))
