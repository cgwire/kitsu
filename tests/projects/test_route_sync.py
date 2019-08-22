from tests.base import ApiDBTestCase

from zou.app.services import breakdown_service


class ProjectSyncRouteTestCase(ApiDBTestCase):

    def setUp(self):
        super(ProjectSyncRouteTestCase, self).setUp()

        self.generate_shot_suite()
        self.generate_assigned_task()
        self.generate_fixture_shot_task()
        self.project_id = str(self.project.id)
        self.task_type_id = str(self.task_type.id)
        self.task_type_animation_id = str(self.task_type_animation.id)
        self.sequence_id = str(self.sequence.id)
        self.episode_id = str(self.episode.id)
        self.asset_type_id = str(self.asset_type.id)

        self.generate_fixture_subscription()
        self.generate_fixture_comment()
        self.generate_fixture_notification()
        self.generate_fixture_preview_file()
        self.generate_fixture_playlist("test")
        self.generate_fixture_build_job("2019-08-01T12:00:00")
        self.generate_fixture_milestone()
        breakdown_service.create_casting_link(self.shot.id, self.asset.id)

        self.generate_fixture_project_standard()
        self.generate_fixture_asset_standard()
        self.generate_fixture_task_standard()
        self.generate_fixture_sequence_standard()
        self.generate_fixture_shot_standard()
        self.task = self.task_standard
        self.project = self.project_standard
        self.generate_fixture_comment()
        self.generate_fixture_notification()
        self.generate_fixture_subscription()
        self.generate_fixture_preview_file()
        self.generate_fixture_playlist("test 2")
        self.generate_fixture_build_job("2019-08-01T13:00:00")
        self.generate_fixture_milestone()
        breakdown_service.create_casting_link(
            self.shot_standard.id,
            self.asset_standard.id
        )

    def test_get_build_jobs(self):
        jobs = self.get("/data/projects/%s/build-jobs" % self.project_id)
        self.assertEqual(len(jobs), 1)

    def test_get_subscriptions(self):
        subscriptions = \
            self.get("/data/projects/%s/subscriptions" % self.project_id)
        self.assertEqual(len(subscriptions), 1)

    def test_get_comments(self):
        comments = self.get("/data/projects/%s/comments" % self.project_id)
        self.assertEqual(len(comments), 1)

    def test_get_notifications(self):
        notitfications = \
            self.get("/data/projects/%s/notifications" % self.project_id)
        self.assertEqual(len(notitfications), 1)

    def test_get_preview_files(self):
        preview_files = \
            self.get("/data/projects/%s/preview-files" % self.project_id)
        self.assertEqual(len(preview_files), 1)

    def test_get_entity_links(self):
        links = self.get("/data/projects/%s/entity-links" % self.project_id)
        self.assertEqual(len(links), 1)

    def test_get_milestones(self):
        milestones = self.get("/data/projects/%s/milestones" % self.project_id)
        self.assertEqual(len(milestones), 1)
