from test.base import ApiTestCase

from zou import __version__
from zou.app import app


class VersionTestCase(ApiTestCase):

    def test_version_route(self):
        data = self.get('/')
        self.assertEquals(data, {
            'api': app.config["APP_NAME"],
            'version': __version__
        })
