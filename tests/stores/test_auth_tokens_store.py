from tests.base import ApiTestCase

from zou.app.stores import auth_tokens_store


class AuthTokensTestCase(ApiTestCase):

    def setUp(self):
        super(AuthTokensTestCase, self).setUp()
        self.store = auth_tokens_store
        self.store.clear()

    def tearDown(self):
        self.store.clear()

    def test_get_and_add(self):
        self.assertIsNone(self.store.get("key-1"))
        self.store.add("key-1", "true")
        self.assertEquals(self.store.get("key-1"), "true")

    def test_delete(self):
        self.store.add("key-1", "true")
        self.store.delete("key-1")
        self.assertIsNone(self.store.get("key-1"))

    def test_is_revoked(self):
        self.assertTrue(self.store.is_revoked({"jti": "key-1"}))
        self.store.add("key-1", "true")
        self.assertTrue(self.store.is_revoked({"jti": "key-1"}))
        self.store.add("key-1", "false")
        self.assertFalse(self.store.is_revoked({"jti": "key-1"}))

    def test_keys(self):
        self.store.add("key-1", "true")
        self.store.add("key-2", "true")
        self.assertTrue("key-1" in self.store.keys())
        self.assertTrue("key-2" in self.store.keys())
