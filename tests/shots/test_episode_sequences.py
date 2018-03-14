from tests.base import ApiDBTestCase


class EpisodeSequencesTestCase(ApiDBTestCase):

    def setUp(self):
        super(EpisodeSequencesTestCase, self).setUp()
        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_entity_type()
        self.generate_fixture_episode()
        self.generate_fixture_sequence("SH01")
        self.serialized_sequence = self.sequence.serialize(obj_type="Sequence")
        self.generate_fixture_sequence("SH02")
        self.generate_fixture_sequence("SH03")
        self.generate_fixture_sequence("SH04")
        self.episode_id = self.episode.id

        episode_02 = self.generate_fixture_episode("E02")
        self.generate_fixture_sequence("SH01", episode_id=episode_02.id)

    def test_get_sequences_for_episode(self):
        sequences = self.get("data/episodes/%s/sequences" % self.episode_id)
        self.assertEquals(len(sequences), 4)
        print([sequence["name"] for sequence in sequences])
        self.assertDictEqual(sequences[0], self.serialized_sequence)
