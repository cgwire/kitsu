import unittest

from zou.app.utils import events
from tests.base import ApiDBTestCase


class EventsTestCase(ApiDBTestCase):

    __name__ = "test_handler"

    def setUp(self):
        super(EventsTestCase, self).setUp()
        self.counter = 1
        events.unregister_all()

    def handle_event(self, data={}):
        self.counter += 1

    def test_register(self):
        events.register("task:start", "inc_counter", self)
        events.emit("task:start")
        self.assertEqual(self.counter, 2)
        events.emit("task:stop")
        self.assertEqual(self.counter, 2)
        events.emit("task:start")
        self.assertEqual(self.counter, 3)

    def test_unregister(self):
        events.register("task:start", "inc_counter", self)
        events.unregister("task:start", "inc_counter")
        events.emit("task:start")
        self.assertEqual(self.counter, 1)

    def test_register_all(self):
        event_map = {
            "task:start": self,
            "task:new": self
        }
        events.register_all(event_map)
        events.emit("task:start")
        self.assertEqual(self.counter, 2)
        events.emit("task:stop")
        self.assertEqual(self.counter, 2)
        events.emit("task:start")
        self.assertEqual(self.counter, 3)
        events.emit("task:new")
        self.assertEqual(self.counter, 4)
