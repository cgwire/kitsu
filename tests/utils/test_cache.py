import unittest

from zou.app.utils import cache


class CacheTestCase(unittest.TestCase):

    __name__ = "test_handler"

    def setUp(self):
        super(CacheTestCase, self).setUp()
        global called
        self.called = 0

    @cache.memoize_function(50)
    def memoized_function(self, parameter):
        self.called = self.called + 1

    @cache.memoize_function(50)
    def memoized_function2(self, parameter):
        import random
        return parameter + str(random.randrange(1, 50))

    def test_memoize(self):
        result = self.memoized_function2("param1")
        result2 = self.memoized_function2("param1")
        result3 = self.memoized_function2("param2")

        self.assertEquals(result, result2)
        self.assertNotEquals(result, result3)
