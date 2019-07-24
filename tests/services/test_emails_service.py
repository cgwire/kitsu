from tests.base import ApiDBTestCase

from zou.app.services import emails_service


class EmailsServiceTestCase(ApiDBTestCase):

    def setUp(self):
        super(EmailsServiceTestCase, self).setUp()

        self.generate_shot_suite()
        self.generate_assigned_task()

    def test_get_signature(self):
        signature = emails_service.get_signature()
        self.assertEqual(signature, """
Best,

Kitsu Team""")

    def test_get_task_descriptors(self):
        (
            author,
            task_name,
            task_url
        ) = emails_service.get_task_descriptors(
            self.person.id,
            self.task.serialize()
        )
        self.assertEqual(
            task_name,
            "Cosmos Landromat / Props / Tree / Shaders"
        )
        self.assertEqual(
            task_url,
            "https://localhost:8080/productions/%s/assets/tasks/%s" % (
                self.project.id,
                self.task.id
            )
        )
        self.generate_fixture_shot_task()
        (
            author,
            task_name,
            task_url
        ) = emails_service.get_task_descriptors(
            self.person.id,
            self.shot_task.serialize()
        )
        self.assertEqual(
            task_name,
            "Cosmos Landromat / E01 / S01 / P01 / Animation"
        )
        self.assertEqual(
            task_url,
            "https://localhost:8080/productions/%s/shots/tasks/%s" % (
                self.project.id,
                self.shot_task.id
            )
        )
