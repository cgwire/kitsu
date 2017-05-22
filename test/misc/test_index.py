from test.base import ApiTestCase

from zou.app.utils import git


class VersionTestCase(ApiTestCase):

    def test_version_route(self):
        data = self.get('/')
        revision_hash = git.get_git_revision_hash()
        self.assertEquals(data, {
            'api': 'Unit Image Pipeline Server',
            'git_hash': revision_hash.decode("utf-8")
        })
