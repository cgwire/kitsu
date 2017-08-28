from test.base import ApiDBTestCase


class CommentWorkingFileTestCase(ApiDBTestCase):

    def setUp(self):
        super(CommentWorkingFileTestCase, self).setUp()

        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_entity_type()
        self.generate_fixture_entity()
        self.generate_fixture_sequence()
        self.generate_fixture_shot()
        self.generate_fixture_department()
        self.generate_fixture_task_type()
        self.generate_fixture_task_status()
        self.generate_fixture_task_status_wip()
        self.generate_fixture_person()
        self.generate_fixture_assigner()
        self.generate_fixture_task()
        self.generate_fixture_software()
        self.generate_fixture_working_file()

    def test_comment_working_file(self):
        comment_data = {
            "comment": "test working file comment"
        }
        self.put(
            "/actions/working-files/%s/comment" % self.working_file.id,
            comment_data
        )
        working_file = self.get("data/working-files/%s" % self.working_file.id)
        self.assertEqual(working_file["comment"], comment_data["comment"])

    def test_comment_working_wrong_data(self):
        comment_data = {
            "comment_wrong": "test working file comment"
        }
        self.put(
            "/actions/working-files/%s/comment" % self.working_file.id,
            comment_data,
            400
        )
