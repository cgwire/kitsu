import uuid
import gazu

from tests.base import ApiDBTestCase

from zou.app.models.entity import Entity
from zou.app.models.project import Project
from zou.app.services import sync_service
from zou.app.utils import events


class SyncServiceTestCase(ApiDBTestCase):


    def setUp(self):
        super(SyncServiceTestCase, self).setUp()

        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_asset_type()
        self.generate_fixture_asset()
        self.generate_fixture_sequence()
        self.generate_fixture_shot()

        self.last_event_data = {}
        events.unregister_all()
        self.new_project_id = str(uuid.uuid4())

        self.real_fetch_one = gazu.client.fetch_one
        def fetch_one_mock(model_name, model_id):
            return {
                "id": self.new_project_id,
                "name": "Test Sync Project",
                "project_status_id": str(self.open_status.id),
                "team": [],
                "type": "Project"
            }
        gazu.client.fetch_one = fetch_one_mock

    def tearDown(self):
        gazu.client.fetch_one = self.real_fetch_one

    def handle_event(self, data={}):
        self.last_event_data = data

    def test_sync_event(self):
        sync_service.sync_event({
            "name": "project:new",
            "data": {"project_id": self.new_project_id}
        })
        self.assertIsNotNone(Project.get(self.new_project_id))
        sync_service.sync_event({
            "name": "project:delete",
            "data": {"project_id": self.new_project_id}
        })
        self.assertIsNone(Project.get(self.new_project_id))

    def test_create_entry(self):
        events.register("project:new", "handle_event", self)
        create_func = sync_service.create_entry(
            "projects", "project", Project, "new")
        create_func({"project_id": self.new_project_id})
        self.assertTrue("project_id" in self.last_event_data)
        self.assertIsNotNone(Project.get(self.last_event_data["project_id"]))

        self.last_event_data = {}
        events.unregister_all()
        events.register("project:update", "handle_event", self)
        create_func = sync_service.create_entry(
            "projects", "project", Project, "update")
        create_func({"project_id": self.new_project_id})
        self.assertTrue("project_id" in self.last_event_data)
        project = Project.get(self.last_event_data["project_id"])
        self.assertEqual(project.name, "Test Sync Project")

    def test_delete_entry(self):
        asset_id = str(self.asset.id)
        events.register("asset:delete", "handle_event", self)
        delete_func = sync_service.delete_entry("assets", "asset", Entity)
        delete_func({"asset_id": asset_id})
        self.assertIsNone(Entity.get(asset_id))
        self.assertTrue("asset_id" in self.last_event_data)

    def test_forward_event(self):
        events.register("task:update", "handle_event", self)
        forward_func = sync_service.forward_event("task:update")
        forward_func({"task_id": "test"})
        self.assertTrue("task_id" in self.last_event_data)

    def test_forward_base_event(self):
        events.register("task:update", "handle_event", self)
        sync_service.forward_base_event("task", "update", {"task_id": "test"})
        self.assertTrue("task_id" in self.last_event_data)
