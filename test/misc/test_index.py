from test.base import ApiTestCase

from zou import __version__


class VersionTestCase(ApiTestCase):

    def test_version_route(self):
        data = self.get('/')
        self.assertEquals(data, {
            'api': 'Zou API',
            'version': __version__
        })
