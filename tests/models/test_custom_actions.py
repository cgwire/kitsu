# -*- coding: UTF-8 -*-
from tests.base import ApiDBTestCase
from zou.app.models.custom_action import CustomAction

from zou.app.utils import fields


class CustomActionTestCase(ApiDBTestCase):

    def setUp(self):
        super(CustomActionTestCase, self).setUp()
        self.generate_data(CustomAction, 3)

    def test_get_custom_actions(self):
        custom_actions = self.get("data/custom-actions")
        self.assertEquals(len(custom_actions), 3)
        self.assertEquals(custom_actions[0]["type"], "CustomAction")

    def test_get_custom_action(self):
        custom_action = self.get_first("data/custom-actions")
        custom_action_again = self.get(
            "data/custom-actions/%s" % custom_action["id"]
        )
        self.assertEquals(custom_action, custom_action_again)
        self.get_404("data/custom-actions/%s" % fields.gen_uuid())

    def test_create_custom_action(self):
        data = {
            "name": "run_render",
            "url": "http://198.168.1.123",
        }
        self.custom_action = self.post("data/custom-actions", data)
        self.assertIsNotNone(self.custom_action["id"])

        custom_actions = self.get("data/custom-actions")
        self.assertEquals(len(custom_actions), 4)

    def test_create_custom_action_with_no_data(self):
        data = {}
        self.custom_action = self.post("data/custom-actions", data, 400)

    def test_create_custom_action_with_wrong_data(self):
        data = {
            "wrong": "data"
        }
        self.custom_action = self.post("data/custom-actions", data, 400)

    def test_update_custom_action(self):
        custom_action = self.get_first("data/custom-actions")
        data = {
            "name": "run_render_2",
        }
        self.put("data/custom-actions/%s" % custom_action["id"], data)
        custom_action_again = self.get(
            "data/custom-actions/%s" % custom_action["id"]
        )
        self.assertEquals(data["name"], custom_action_again["name"])
        self.put_404("data/custom-actions/%s" % fields.gen_uuid(), data)

    def test_delete_custom_action(self):
        custom_actions = self.get("data/custom-actions")
        self.assertEquals(len(custom_actions), 3)

        custom_action = custom_actions[1]
        self.delete("data/custom-actions/%s" % custom_action["id"])
        custom_actions = self.get("data/custom-actions")
        self.assertEquals(len(custom_actions), 2)

        self.delete_404("data/custom_actions/%s" % fields.gen_uuid())
        custom_actions = self.get("data/custom-actions")
        self.assertEquals(len(custom_actions), 2)
