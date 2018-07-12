import json
import datetime

from tests.base import ApiDBTestCase

from zou.app.utils import commands
from zou.app.stores import auth_tokens_store
from zou.app.models.entity_type import EntityType
from zou.app.models.task_type import TaskType


def totimestamp(dt, epoch=datetime.datetime(1970, 1, 1)):
    td = dt - epoch
    return (td.microseconds + (td.seconds + td.days * 86400) * 10**6) / 10**6


class CommandsTestCase(ApiDBTestCase):

    def setUp(self):
        super(CommandsTestCase, self).setUp()
        self.store = auth_tokens_store
        for key in self.store.keys():
            self.store.delete(key)

    def test_clean_auth_tokens_revoked(self):
        now = datetime.datetime.now()
        self.store.add("testkey", json.dumps({
            "token": {
                "exp": totimestamp(now + datetime.timedelta(days=8))
            },
            "revoked": False
        }).encode("utf-8"))
        self.store.add("testkey2", json.dumps({
            "token": {
                "exp": totimestamp(now + datetime.timedelta(days=8))
            },
            "revoked": True
        }).encode("utf-8"))
        self.assertEquals(len(self.store.keys()), 2)
        commands.clean_auth_tokens()
        self.assertEquals(len(self.store.keys()), 1)
        self.assertEquals(self.store.keys()[0], "testkey")

    def test_clean_auth_tokens_expired(self):
        now = datetime.datetime.now()
        self.store.add("testkey", json.dumps({
            "token": {
                "exp": totimestamp(now - datetime.timedelta(days=8))
            },
            "revoked": False
        }).encode("utf-8"))
        self.store.add("testkey2", json.dumps({
            "token": {
                "exp": totimestamp(now + datetime.timedelta(days=8))
            },
            "revoked": False
        }).encode("utf-8"))

        self.assertEquals(len(self.store.keys()), 2)
        commands.clean_auth_tokens()
        self.assertEquals(len(self.store.keys()), 1)
        self.assertEquals(self.store.keys()[0], "testkey2")

    def test_init_data(self):
        commands.init_data()
        task_types = TaskType.get_all()
        asset_types = EntityType.get_all()
        self.assertEqual(len(task_types), 11)
        self.assertEqual(len(asset_types), 8)
