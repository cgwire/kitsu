from tests.base import ApiTestCase

from zou import __version__
from zou.app import app


class VersionTestCase(ApiTestCase):

    def test_version_route(self):
        data = self.get("/")
        self.assertEqual(data, {
            "api": app.config["APP_NAME"],
            "version": __version__
        })

    def test_status_route(self):
        data = self.get("/status")
        self.assertTrue("database-up" in data)
        self.assertTrue("event-stream-up" in data)
        self.assertTrue("key-value-store-up" in data)
