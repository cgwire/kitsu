from tests.base import ApiDBTestCase

from zou.app.models.output_type import OutputType

from zou.app.utils import fields


class OutputTypeTestCase(ApiDBTestCase):

    def setUp(self):
        super(OutputTypeTestCase, self).setUp()
        self.generate_data(OutputType, 3)

    def test_get_output_types(self):
        output_types = self.get("data/output-types")
        self.assertEquals(len(output_types), 3)

    def test_get_output_type(self):
        output_type = self.get_first("data/output-types")
        output_type_again = self.get("data/output-types/%s" % output_type["id"])
        self.assertEquals(output_type, output_type_again)
        self.get_404("data/output-types/%s" % fields.gen_uuid())

    def test_create_output_type(self):
        data = {
            "name": "geometry",
            "short_name": "geo"
        }
        self.output_type = self.post("data/output-types", data)
        self.assertIsNotNone(self.output_type["id"])

        output_types = self.get("data/output-types")
        self.assertEquals(len(output_types), 4)

    def test_update_output_type(self):
        output_type = self.get_first("data/output-types")
        data = {
            "name": "point cache"
        }
        self.put("data/output-types/%s" % output_type["id"], data)
        output_type_again = self.get(
            "data/output-types/%s" % output_type["id"])
        self.assertEquals(data["name"], output_type_again["name"])
        self.put_404("data/output-types/%s" % fields.gen_uuid(), data)

    def test_delete_output_type(self):
        output_types = self.get("data/output-types")
        self.assertEquals(len(output_types), 3)
        output_type = output_types[0]
        self.delete("data/output-types/%s" % output_type["id"])
        output_types = self.get("data/output-types")
        self.assertEquals(len(output_types), 2)
        self.delete_404("data/output-types/%s" % fields.gen_uuid())
