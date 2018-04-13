from tests.base import ApiDBTestCase


class SequenceTestCase(ApiDBTestCase):

    def setUp(self):
        super(SequenceTestCase, self).setUp()
        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_asset_type()
        self.generate_fixture_department()
        self.generate_fixture_task_type()
        self.generate_fixture_task_status()
        self.generate_fixture_assigner()
        self.generate_fixture_person()

        self.generate_fixture_episode()
        self.generate_fixture_sequence()
        self.serialized_sequence = self.sequence.serialize(obj_type="Sequence")
        self.generate_fixture_sequence("SE02")
        self.generate_fixture_sequence("SE03")

    def test_get_sequences(self):
        sequences = self.get("data/sequences")
        self.assertEquals(len(sequences), 3)
        self.assertDictEqual(sequences[0], self.serialized_sequence)

    def test_get_sequence(self):
        sequence = self.get("data/sequences/%s" % self.sequence.id)
        self.assertEquals(sequence["id"], str(self.sequence.id))
        self.assertEquals(sequence["name"], self.sequence.name)
        self.assertEquals(sequence["episode_name"], self.episode.name)
        self.assertEquals(sequence["episode_id"], str(self.episode.id))
        self.assertEquals(sequence["project_name"], self.project.name)

    def test_get_sequence_by_name(self):
        sequences = self.get(
            "data/sequences?name=%s" % self.sequence.name.lower())
        self.assertEquals(sequences[0]["id"], str(self.sequence.id))

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

    def test_get_sequences_for_project(self):
        sequences = self.get("data/projects/%s/sequences" % self.project.id)
        self.assertEquals(len(sequences), 3)
        self.assertDictEqual(
            sequences[0],
            self.serialized_sequence
        )

    def test_get_sequences_for_project_404(self):
        self.get("data/projects/unknown/sequences", 404)

    def test_get_shots_for_sequence(self):
        self.generate_fixture_shot()
        shot = self.shot.serialize(obj_type="Shot")
        shots = self.get("data/sequences/%s/shots" % self.sequence.id)
        self.assertEquals(len(shots), 1)
        self.assertEqual(shots[0]["id"], shot["id"])
