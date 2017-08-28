from test.base import ApiDBTestCase

from zou.app.models.software import Software

from zou.app.utils import fields


class SoftwareTestCase(ApiDBTestCase):

    def setUp(self):
        super(SoftwareTestCase, self).setUp()
        self.generate_data(Software, 3)

    def test_get_softwares(self):
        softwares = self.get("data/softwares")
        self.assertEquals(len(softwares), 3)

    def test_get_software(self):
        software = self.get_first("data/softwares")
        software_again = self.get("data/softwares/%s" % software["id"])
        self.assertEquals(software, software_again)
        self.get_404("data/softwares/%s" % fields.gen_uuid())

    def test_create_software(self):
        data = {
            "name": "3dsMax",
            "short_name": "max",
            "file_extension": ".max"
        }
        self.software = self.post("data/softwares", data)
        self.assertIsNotNone(self.software["id"])

        softwares = self.get("data/softwares")
        self.assertEquals(len(softwares), 4)

    def test_update_software(self):
        software = self.get_first("data/softwares")
        data = {
            "name": "Maya",
            "file_extension": ".ma",
        }
        self.put("data/softwares/%s" % software["id"], data)
        software_again = self.get(
            "data/softwares/%s" % software["id"])
        self.assertEquals(data["name"], software_again["name"])
        self.put_404("data/softwares/%s" % fields.gen_uuid(), data)

    def test_delete_software(self):
        softwares = self.get("data/softwares")
        self.assertEquals(len(softwares), 3)
        software = softwares[0]
        self.delete("data/softwares/%s" % software["id"])
        softwares = self.get("data/softwares")
        self.assertEquals(len(softwares), 2)
        self.delete_404("data/softwares/%s" % fields.gen_uuid())
