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
