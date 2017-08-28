from test.base import ApiDBTestCase

from zou.app.models.file_status import FileStatus

from zou.app.utils import fields


class FileStatusTestCase(ApiDBTestCase):

    def setUp(self):
        super(FileStatusTestCase, self).setUp()
        self.generate_data(FileStatus, 3)

    def test_get_file_statuss(self):
        file_statuss = self.get("data/file-status")
        self.assertEquals(len(file_statuss), 3)

    def test_get_file_status(self):
        file_status = self.get_first("data/file-status")
        file_status_again = self.get("data/file-status/%s" % file_status["id"])
        self.assertEquals(file_status, file_status_again)
        self.get_404("data/file-status/%s" % fields.gen_uuid())

    def test_create_file_status(self):
        data = {
            "name": "open",
            "color": "#000000"
        }
        self.file_status = self.post("data/file-status", data)
        self.assertIsNotNone(self.file_status["id"])

        file_statuss = self.get("data/file-status")
        self.assertEquals(len(file_statuss), 4)

    def test_update_file_status(self):
        file_status = self.get_first("data/file-status")
        data = {
            "color": "#FFFFFF"
        }
        self.put("data/file-status/%s" % file_status["id"], data)
        file_status_again = self.get(
            "data/file-status/%s" % file_status["id"])
        self.assertEquals(data["color"], file_status_again["color"])
        self.put_404("data/file-status/%s" % fields.gen_uuid(), data)

    def test_delete_file_status(self):
        file_statuss = self.get("data/file-status")
        self.assertEquals(len(file_statuss), 3)
        file_status = file_statuss[0]
        self.delete("data/file-status/%s" % file_status["id"])
        file_statuss = self.get("data/file-status")
        self.assertEquals(len(file_statuss), 2)
        self.delete_404("data/file-status/%s" % fields.gen_uuid())
