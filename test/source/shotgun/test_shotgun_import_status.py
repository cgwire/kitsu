from test.source.shotgun.base import ShotgunTestCase


class ImportShotgunStatusTestCase(ShotgunTestCase):

    def setUp(self):
        super(ImportShotgunStatusTestCase, self).setUp()

    def test_import_status(self):
        self.status = self.load_fixture('status')
        self.assertEqual(len(self.status), 6)

    def test_import_status_twice(self):
        self.load_fixture('status')
        self.status = self.load_fixture('status')
        self.assertEqual(len(self.status), 6)

    def test_import_wrong_status(self):
        data = [
            {"bad": "wrong"}
        ]
        self.status = self.post("data/import/shotgun/status", data, 200)
        self.assertEqual(len(self.status), 0)

    def test_import_a_status(self):
        sg_status = {
            "bg_color": "202,225,202",
            "code": "act",
            "icon": {
                "id": 7,
                "name": "Active",
                "type": "Icon"
            },
            "id": 7,
            "name": "Active",
            "type": "Status"
        }

        api_path = "data/import/shotgun/status"
        self.statuses = self.post(api_path, [sg_status], 200)
        self.assertEqual(len(self.statuses), 1)

        self.statuses = self.get("data/task_status")
        self.assertEqual(len(self.statuses), 1)

        status = self.statuses[0]
        self.assertEqual(status["name"], sg_status["name"])
        self.assertEqual(status["short_name"], sg_status["code"])
        self.assertEqual(status["shotgun_id"], sg_status["id"])
        self.assertEqual(status["color"], "#cae1ca")

    def test_import_a_status_with_same_name(self):
        self.status = self.load_fixture('status')
        self.statuses = self.get("data/task_status")

        self.assertEqual(len(self.statuses), 6)
        sg_status = {
            "bg_color": "202,225,202",
            "code": "app",
            "icon": {
                "id": 7,
                "name": "Approved",
                "type": "Icon"
            },
            "id": 7,
            "name": "Approved",
            "type": "Status"
        }
        api_path = "data/import/shotgun/status"
        self.statuses = self.post(api_path, [sg_status], 200)

        self.statuses = self.get("data/task_status")
        self.assertEqual(len(self.statuses), 7)
