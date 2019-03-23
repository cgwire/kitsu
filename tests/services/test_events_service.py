import time
from tests.base import ApiDBTestCase

from zou.app.utils import fields
from zou.app.services import (
    events_service,
    assets_service
)


class EventsServiceTestCase(ApiDBTestCase):

    def setUp(self):
        super(EventsServiceTestCase, self).setUp()

        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_asset_type()

    def test_get_last_events(self):
        asset = assets_service.create_asset(
            self.project.id,
            self.asset_type.id,
            "test 1",
            "",
            {}
        )
        date = fields.get_date_object(asset["created_at"], "%Y-%m-%dT%H:%M:%S")
        time.sleep(1)
        asset = assets_service.create_asset(
            self.project.id,
            self.asset_type.id,
            "test 2",
            "",
            {}
        )
        time.sleep(1)
        asset = assets_service.create_asset(
            self.project.id,
            self.asset_type.id,
            "test 3",
            "",
            {}
        )
        events = events_service.get_last_events()
        self.assertEqual(len(events), 3)
        events = events_service.get_last_events(page_size=2)
        self.assertEqual(len(events), 2)
        date = fields.get_date_object(asset["created_at"], "%Y-%m-%dT%H:%M:%S")
        events = events_service.get_last_events(before=date)
        self.assertEqual(len(events), 2)

    def test_get_last_login_logs(self):
        self.generate_fixture_person()
        login_logs = events_service.get_last_login_logs()
        self.assertEqual(len(login_logs), 1)

        events_service.create_login_log(self.person.id, "127.0.0.1", "web")
        events_service.create_login_log(self.person.id, "127.0.0.1", "web")
        events_service.create_login_log(self.person.id, "127.0.0.1", "web")
        login_logs = events_service.get_last_login_logs()
        self.assertEqual(len(login_logs), 4)
        login_logs = events_service.get_last_login_logs(page_size=2)
        self.assertEqual(len(login_logs), 2)
