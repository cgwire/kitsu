import datetime
import uuid

from test.base import ApiDBTestCase
from mixer.backend.flask import mixer
from zou.app.models.person import Person


class DateTestCase(ApiDBTestCase):

    def setUp(self):
        super(DateTestCase, self).setUp()
        mixer.init_app(self.flask_app)
        self.now = datetime.datetime.utcnow()
        self.generate_fixture_person()

    def test_create_date(self):
        self.assertIsNotNone(self.person.created_at)
        self.assertGreater(self.person.created_at,
                           self.now)

    def test_update_date(self):
        self.person.last_name = 'Doe'
        self.person.save()
        self.assertIsNotNone(self.person.updated_at)
        self.assertGreater(self.person.updated_at,
                           self.person.created_at)
