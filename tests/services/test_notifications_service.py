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
        self.person_dict = self.generate_fixture_person(
            first_name="Jane",
            email="jane.doe@gmail.com"
        ).serialize()

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

    def test_subscribe_task(self):
        self.generate_fixture_comment()
        recipients = notifications_service.get_notification_recipients(
            self.task_dict
        )
        self.assertFalse(self.person_dict["id"] in recipients)

        notifications_service.subscribe_to_task(
            self.person_dict["id"],
            self.task_dict["id"]
        )
        recipients = notifications_service.get_notification_recipients(
            self.task_dict
        )
        self.assertTrue(self.person_dict["id"] in recipients)

    def test_unsubscribe_task(self):
        self.generate_fixture_comment()
        notifications_service.subscribe_to_task(
            self.person_dict["id"],
            self.task_dict["id"]
        )
        notifications_service.unsubscribe_from_task(
            self.person_dict["id"],
            self.task_dict["id"]
        )
        recipients = notifications_service.get_notification_recipients(
            self.task_dict
        )
        self.assertFalse(self.person_dict["id"] in recipients)
