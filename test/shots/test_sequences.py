from test.base import ApiDBTestCase
from zou.app.models.entity import Entity


class SequenceTestCase(ApiDBTestCase):

    def setUp(self):
        super(SequenceTestCase, self).setUp()
        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_entity_type()
        self.generate_fixture_sequence()
        self.generate_fixture_department()
        self.generate_fixture_task_type()
        self.generate_fixture_task_status()
        self.generate_fixture_assigner()
        self.generate_fixture_person()
        self.generate_data(
            Entity,
            3,
            entities_out=[],
            entities_in=[],
            project_id=self.project.id,
            entity_type_id=self.entity_type.id,
        )
        self.generate_data(
            Entity,
            2,
            entities_out=[],
            entities_in=[],
            project_id=self.project.id,
            entity_type_id=self.sequence_type.id
        )

    def test_get_sequences(self):
        sequences = self.get("data/sequences")
        self.assertEquals(len(sequences), 3)
        self.assertDictEqual(
            sequences[0],
            self.sequence.serialize(obj_type="Sequence")
        )

    def test_get_sequence(self):
        sequence = self.get("data/sequences/%s" % self.sequence.id)
        self.assertDictEqual(
            sequence,
            self.sequence.serialize(obj_type="Sequence")
        )

    def test_get_sequence_tasks(self):
        self.generate_fixture_sequence_task()
        tasks = self.get("data/sequences/%s/tasks" % self.sequence.id)
        self.assertEquals(len(tasks), 1)
        self.assertEqual(tasks[0]["id"], str(self.sequence_task.id))

    def test_create_sequence(self):
        self.generate_fixture_episode()
        sequence_name = "NSE01"
        project_id = str(self.project.id)
        episode_id = str(self.episode.id)
        data = {"name": sequence_name, "episode_id": episode_id}
        sequence = self.post(
            "data/projects/%s/sequences" % project_id,
            data
        )
        sequence = self.get("data/sequences/%s" % sequence["id"])
        self.assertEquals(sequence["name"], sequence_name)
        self.assertEquals(sequence["parent_id"], episode_id)
