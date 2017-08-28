from test.base import ApiDBTestCase
from zou.app.models.entity import Entity


class EpisodeSequencesTestCase(ApiDBTestCase):

    def setUp(self):
        super(EpisodeSequencesTestCase, self).setUp()
        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_entity_type()
        self.generate_fixture_episode()
        self.generate_fixture_sequence()
        self.generate_fixture_shot()
        self.sequences = self.generate_data(
            Entity, 3,
            entities_out=[],
            project_id=self.project.id,
            parent_id=self.episode.id,
            entity_type_id=self.sequence_type.id
        )
        self.episode_id = self.episode.id
        self.serialized_sequence = self.sequence.serialize(obj_type="Sequence")

    def test_get_sequences_for_episode(self):
        sequences = self.get("data/episodes/%s/sequences" % self.episode_id)
        self.assertEquals(len(sequences), 4)
        self.assertDictEqual(sequences[0], self.serialized_sequence)
