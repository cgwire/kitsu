from tests.base import ApiDBTestCase

from zou.app.models.notifications import Notification
from zou.app.services import notifications_service, tasks_service


class NotificationsServiceTestCase(ApiDBTestCase):

    def setUp(self):
        super(NotificationsServiceTestCase, self).setUp()

        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_asset_type()
        self.generate_fixture_asset()
        self.generate_fixture_episode()
        self.generate_fixture_sequence()
        self.generate_fixture_shot()

    def generate_fixture_comment(self):
        self.generate_fixture_person()
        self.generate_fixture_assigner()
        self.generate_fixture_department()
        self.generate_fixture_task_type()
        self.generate_fixture_task_status()
        self.task_dict = self.generate_fixture_task().serialize()

        self.comment = tasks_service.create_comment(
            self.task.id,
            self.task_status.id,
            self.user.id,
            "first comment"
        )

    def test_get_full_entity_name(self):
        asset_name = notifications_service.get_full_entity_name(self.asset.id)
        shot_name = notifications_service.get_full_entity_name(self.shot.id)
        self.assertEquals(asset_name, "Props / Tree")
        self.assertEquals(shot_name, "E01 / S01 / P01")

    def test_create_notification(self):
        self.generate_fixture_comment()
        notification = notifications_service.create_notification(
            self.person.serialize(),
            self.comment,
            False,
            False
        )
        notification_again = Notification.get(notification["id"])
        self.assertIsNotNone(notification_again)

    def test_get_notification_recipients(self):
        self.generate_fixture_comment()
        person_ids = notifications_service.get_notification_recipients(
            self.task_dict)
        self.assertEqual(len(person_ids), 2)

    def test_create_notifications_for_task_and_comment(self):
        self.generate_fixture_comment()
        notifications_service.create_notifications_for_task_and_comment(
            self.task_dict,
            self.comment
        )
        notifications = Notification.get_all()
        self.assertEqual(len(notifications), 1)
        self.assertEqual(notifications[0].author_id, self.user.id)
