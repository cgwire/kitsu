import time
from tests.base import ApiDBTestCase

from zou.app.utils import fields
from zou.app.services import (
    events_service,
    assets_service
)


class EventsRoutesTestCase(ApiDBTestCase):

    def setUp(self):
        super(EventsRoutesTestCase, self).setUp()

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
        events = self.get("/data/events/last")
        self.assertEqual(len(events), 3)
        events = self.get("/data/events/last?page_size=2")
        self.assertEqual(len(events), 2)
        date = asset["created_at"]
        events = self.get("/data/events/last?before=%s" % date)
        self.assertEqual(len(events), 2)
