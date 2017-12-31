from tests.base import ApiDBTestCase

from zou.app.models.output_file import OutputFile


class GetNextRevisionTestCase(ApiDBTestCase):

    def setUp(self):
        super(GetNextRevisionTestCase, self).setUp()

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
        self.generate_fixture_shot_task()
        self.generate_fixture_software()
        self.generate_fixture_working_file()
        self.generate_fixture_shot_working_file()
        self.generate_fixture_file_status()
        self.generate_fixture_output_type()
        self.generate_fixture_output_file()

    def test_get_next_revision(self):
        result = self.post(
            "/data/entities/%s/output-types/%s/next-revision" % (
                self.entity.id,
                self.output_type.id
            ),
            {"name": "main"},
            200
        )
        self.assertEqual(result["next_revision"], 2)

    def test_get_next_revision_for_name(self):
        self.generate_fixture_output_file(revision=5, name="other-output")
        result = self.post(
            "/data/entities/%s/output-types/%s/next-revision" % (
                self.entity.id,
                self.output_type.id
            ),
            {"name": "other-output"},
            200
        )
        self.assertEqual(result["next_revision"], 6)

    def test_get_next_revision_wrong_data(self):
        self.post(
            "/data/tasks/unknown/output-types/unknown/next-revision",
            {"name": "main"},
            404
        )

    def test_get_next_revision_with_empty_revision(self):
        output_file = OutputFile(
            name="test",
            entity_id=self.entity.id,
            file_status_id=self.file_status.id
        )
        output_file.save()

        result = self.post(
            "/data/entities/%s/output-types/%s/next-revision" % (
                self.entity.id,
                self.output_type.id
            ),
            {"name": "main"},
            200
        )
        self.assertEqual(result["next_revision"], 2)
