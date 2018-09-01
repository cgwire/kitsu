# -*- coding: UTF-8 -*-
import uuid

from tests.source.shotgun.base import ShotgunTestCase
from zou.app.models.data_import_error import DataImportError

event = {
    "attribute_name": "code",
    "entity": {"id": 1855, "name": "seq1", "type": "Shot"},
    "event_type": "Shotgun_Shot_Change",
    "id": 705015,
    "meta": {
        "attribute_name": "code",
        "entity_id": 1855,
        "entity_type": "Shot",
        "field_data_type": "text",
        "new_value": "premiere seq",
        "old_value": "seq autre",
        "type": "attribute_change"
    },
    "project": {
        "id": 87,
        "name": "Big Buck Bunny",
        "type": "Project"
    },
    "session_uuid": "7a3cce32-d418-11e6-ab65-0242ac110005",
    "type": "EventLogEntry",
    "user": {
        "id": 132,
        "name": "John Doe",
        "type": "HumanUser"
    }
}


class DataImportErrorTestCase(ShotgunTestCase):

    def setUp(self):
        super(DataImportErrorTestCase, self).setUp()
        self.error = DataImportError(
            event_data=event,
            source="shotgun"
        )
        self.error.save()
        self.error_id = self.error.id

    def test_list_event_errors(self):
        errors = self.get("/import/shotgun/errors")
        self.assertEqual(len(errors), 1)
        self.assertDictEqual(errors[0], self.error.serialize())

    def test_create_event_error(self):
        self.post("/import/shotgun/errors", event)
        errors = self.get("/import/shotgun/errors")
        self.assertEqual(len(errors), 2)
        self.error = DataImportError.get(self.error_id)
        self.assertEqual(errors[1]["source"], "shotgun")
        self.assertEqual(
            errors[1]["event_data"]["project"]["name"],
            event["project"]["name"]
        )

    def test_delete_event_error(self):
        errors = self.delete(
            "/import/shotgun/errors/%s" % self.error.id)
        errors = self.get("/import/shotgun/errors")
        self.assertEqual(len(errors), 0)

    def test_delete_event_error_wrong_id_format(self):
        errors = self.delete(
            "/import/shotgun/errors/unknown", 404)
        errors = self.get("/import/shotgun/errors")
        self.assertEqual(len(errors), 1)

    def test_delete_event_error_404(self):
        errors = self.delete(
            "/import/shotgun/errors/%s" % uuid.uuid4(), 404)
        errors = self.get("/import/shotgun/errors")
        self.assertEqual(len(errors), 1)
