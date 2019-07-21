from tests.base import ApiDBTestCase

from zou.app.services import (
    tasks_service,
    news_service
)


class NewsRoutesTestCase(ApiDBTestCase):

    def setUp(self):
        super(NewsRoutesTestCase, self).setUp()

        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_asset_type()
        self.generate_fixture_asset()
        self.generate_fixture_episode()
        self.generate_fixture_sequence()
        self.generate_fixture_shot()
        self.sequence_dict = self.sequence.serialize()
        self.project_dict = self.sequence.serialize()

    def generate_fixture_comment(self):
        self.generate_fixture_person()
        self.generate_fixture_assigner()
        self.generate_fixture_department()
        self.generate_fixture_task_type()
        self.task_type_dict = self.task_type_animation.serialize()
        self.generate_fixture_task_status()
        self.task = self.generate_fixture_shot_task()
        self.task_dict = self.task.serialize()
        self.person_dict = self.generate_fixture_person(
            first_name="Jane",
            email="jane.doe@gmail.com"
        ).serialize()

        self.comment = tasks_service.create_comment(
            self.task.id,
            self.task_status.id,
            self.user["id"],
            "first comment"
        )

    def test_get_last_news_for_project(self):
        self.generate_fixture_comment()
        for i in range(1, 81):
            comment = tasks_service.create_comment(
                self.task.id,
                self.task_status.id,
                self.user["id"],
                "comment %s" % i
            )
            news = news_service.create_news_for_task_and_comment(
                self.task_dict,
                comment
            )
        news_list = self.get(
            "/data/projects/%s/news" % self.task_dict["project_id"]
        )
        self.assertEqual(len(news_list), 50)
        news = news_list[0]
        self.assertEqual(news["project_name"], "Cosmos Landromat")
        self.assertEqual(news["full_entity_name"], "E01 / S01 / P01")
        self.assertEqual(news["project_id"], self.task_dict["project_id"])

        news_list = self.get(
            "/data/projects/%s/news?page=2" % self.task_dict["project_id"]
        )
        self.assertEqual(len(news_list), 30)

        news_list = self.get(
            "/data/projects/%s/news/%s" % (
                self.task_dict["project_id"],
                news["id"]
            )
        )
        self.assertEqual(len(news_list), 1)
