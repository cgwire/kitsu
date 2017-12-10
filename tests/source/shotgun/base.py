import json

from tests.base import ApiDBTestCase


class ShotgunTestCase(ApiDBTestCase):

    def setUp(self):
        super(ShotgunTestCase, self).setUp()

    def load_fixture(self, data_type):
        file_path = "./tests/fixtures/shotgun/%s.json" % data_type
        api_path = "/import/shotgun/%s" % data_type
        data = json.loads(open(file_path).read())
        return self.post(api_path, data, 200)
