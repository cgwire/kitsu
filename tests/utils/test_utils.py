import os
import datetime
import unittest
import uuid

from babel import Locale
from pytz import timezone

from zou.app.utils import colors, fields, query, fs
from zou.app.models.person import Person
from zou.app.models.task import Task


class UtilsTestCase(unittest.TestCase):

    def test_rgb_to_hex(self):
        self.assertEqual(colors.rgb_to_hex("0,0,0"), "#000000")
        self.assertEqual(colors.rgb_to_hex("255,255,255"), "#ffffff")

    def test_serialize_value(self):
        now = datetime.datetime.now()
        self.assertEqual(now.isoformat(), fields.serialize_value(now))
        unique_id = uuid.uuid4()
        self.assertEqual(str(unique_id), fields.serialize_value(unique_id))
        self.assertEqual(
            {"now": now.isoformat()},
            fields.serialize_value({"now": now})
        )
        self.assertEqual(
            "Europe/Paris",
            fields.serialize_value(timezone("Europe/Paris"))
        )
        self.assertEqual(
            "Europe/Brussels",
            fields.serialize_value(timezone("Europe/Brussels"))
        )
        self.assertEqual(
            "en_US",
            fields.serialize_value(Locale("en_US"))
        )

    def test_serialize_dict(self):
        now = datetime.datetime.now()
        unique_id = uuid.uuid4()

        data = {
            "now": now,
            "unique_id": unique_id,
            "string": "test"
        }
        result = {
            "now": now.isoformat(),
            "unique_id": str(unique_id),
            "string": "test"
        }
        self.assertEqual(fields.serialize_dict(data), result)
        self.assertEqual(fields.serialize_value(data), result)

    def test_serialize_orm_array(self):
        person = Person(
            id=uuid.uuid4(),
            first_name="Jhon",
            last_name="Doe"
        )
        person2 = Person(
            id=uuid.uuid4(),
            first_name="Emma",
            last_name="Peel"
        )
        task = Task(
            id=uuid.uuid4(),
            name="Test Task",
            assignees=[person, person2]
        )

        is_id = str(person.id) in fields.serialize_orm_arrays(task.assignees)
        self.assertTrue(is_id)
        is_id = str(person2.id) in fields.serialize_orm_arrays(task.assignees)
        self.assertTrue(is_id)
        is_id = str(person.id) in fields.serialize_value(task.assignees)
        self.assertTrue(is_id)
        is_id = str(person2.id) in fields.serialize_value(task.assignees)
        self.assertTrue(is_id)

    def test_get_query_criterions(self):
        request = type('test', (object,), {})()
        request.args = {
            "page": "1",
            "name": "Test",
            "project_id": "1234"
        }
        criterions = query.get_query_criterions_from_request(request)
        self.assertDictEqual(criterions, {
            "name": "Test",
            "project_id": "1234"
        })

    def test_mkdirp(self):
        folder = "one/two/three"
        fs.mkdir_p(folder)
        self.assertTrue(os.path.exists(folder))
        fs.rm_rf("one")
        self.assertTrue(not os.path.exists(folder))
