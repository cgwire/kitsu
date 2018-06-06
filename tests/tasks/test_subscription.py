from tests.base import ApiDBTestCase

from zou.app.services import notifications_service


class SubscriptionRouteTestCase(ApiDBTestCase):

    def setUp(self):
        super(SubscriptionRouteTestCase, self).setUp()

        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_asset_type()
        self.generate_fixture_asset()
        self.generate_fixture_sequence()
        self.generate_fixture_shot()
        self.generate_fixture_department()
        self.generate_fixture_task_type()
        self.generate_fixture_task_status()
        self.generate_fixture_person()
        self.generate_fixture_assigner()
        self.generate_fixture_task_status_wip()
        self.user_id = str(self.user.id)
