from test.base import ApiDBTestCase

from zou.app.services import shots_service
from zou.app.services.exception import SequenceNotFoundException


class ShotUtilsTestCase(ApiDBTestCase):

    def setUp(self):
        super(ShotUtilsTestCase, self).setUp()

        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_entity_type()
        self.generate_fixture_episode()
        self.generate_fixture_sequence()
        self.generate_fixture_shot()
        self.generate_fixture_entity()

    def test_get_sequence_from_shot(self):
        sequence = shots_service.get_sequence_from_shot(self.shot)
        self.assertEquals(sequence.name, 'S01')

    def test_get_episode_from_shot(self):
        episode = shots_service.get_episode_from_sequence(self.sequence)
        self.assertEquals(episode.name, 'E01')

    def test_get_sequence_from_shot_no_sequence(self):
        self.assertRaises(
            SequenceNotFoundException,
            shots_service.get_sequence_from_shot,
            self.shot_noseq
        )

    def test_get_sequence_type(self):
        sequence_type = shots_service.get_sequence_type()
        self.assertEqual(sequence_type.name, "Sequence")

    def test_get_shot_type(self):
        shot_type = shots_service.get_shot_type()
        self.assertEqual(shot_type.name, "Shot")

    def test_get_episode_type(self):
        episode_type = shots_service.get_episode_type()
        self.assertEqual(episode_type.name, "Episode")

    def test_get_sequences(self):
        sequences = shots_service.get_sequences()
        self.assertDictEqual(
            sequences[0].serialize(),
            self.sequence.serialize()
        )

    def test_get_episode_map(self):
        self.generate_fixture_episode("E02")
        episode_map = shots_service.get_episode_map()
        self.assertEquals(len(episode_map.keys()), 2)
        self.assertEquals(
            episode_map[self.episode.id].name,
            self.episode.name
        )

    def test_get_shot_map(self):
        self.generate_fixture_shot("P02")
        shot_map = shots_service.get_shot_map()
        self.assertEquals(len(shot_map.keys()), 2)
        self.assertEquals(
            shot_map[str(self.shot.id)]["name"],
            self.shot.name
        )

    def test_get_shots(self):
        shots = shots_service.get_shots()
        self.shot_dict = self.shot.serialize(obj_type="Shot")
        self.shot_dict["project_name"] = self.project.name
        self.shot_dict["sequence_name"] = self.sequence.name
        self.assertDictEqual(shots[0], self.shot_dict)

    def test_get_shots_and_tasks(self):
        self.generate_fixture_person()
        self.generate_fixture_assigner()
        self.generate_fixture_department()
        self.generate_fixture_task_status()
        self.generate_fixture_task_type()
        self.generate_fixture_shot_task()
        self.generate_fixture_shot_task(name="Secondary")
        self.generate_fixture_shot("P02")

        shots = shots_service.get_shots_and_tasks()
        shots = sorted(shots, key=lambda s: s["name"])
        self.assertEqual(len(shots), 2)
        self.assertEqual(len(shots[0]["tasks"]), 2)
        self.assertEqual(len(shots[1]["tasks"]), 0)
        self.assertEqual(
            shots[0]["tasks"][1]["task_status_name"], "Open"
        )
        self.assertEqual(
            shots[0]["tasks"][0]["task_type_name"], "Animation"
        )
        self.assertEqual(
            shots[0]["tasks"][0]["assignees"][0], str(self.person.id)
        )
        self.assertEqual(shots[0]["episode_name"], "E01")

    def test_is_shot(self):
        self.assertTrue(shots_service.is_shot(self.shot))
        self.assertFalse(shots_service.is_shot(self.entity))

    def test_is_sequence(self):
        self.assertTrue(shots_service.is_sequence(self.sequence))
        self.assertFalse(shots_service.is_sequence(self.entity))

    def test_get_shot(self):
        self.assertEquals(self.shot.id, shots_service.get_shot(self.shot.id).id)

    def test_get_sequence(self):
        self.assertEquals(
            self.sequence.id,
            shots_service.get_sequence(self.sequence.id).id
        )

    def test_get_episode(self):
        self.assertEquals(
            self.episode.id,
            shots_service.get_episode(self.episode.id).id
        )

    def test_create_episode(self):
        episode_name = "NE01"
        episode = shots_service.create_episode(
            self.project.id,
            episode_name
        )
        self.assertEquals(episode["name"], episode_name)

    def test_create_sequence(self):
        sequence_name = "NSE01"
        parent_id = str(self.episode.id)
        sequence = shots_service.create_sequence(
            self.project.id,
            parent_id,
            sequence_name
        )
        self.assertEquals(sequence["name"], sequence_name)
        self.assertEquals(sequence["parent_id"], parent_id)

    def test_create_shot(self):
        shot_name = "NSH01"
        parent_id = str(self.sequence.id)
        shot = shots_service.create_shot(
            self.project.id,
            parent_id,
            shot_name
        )
        self.assertEquals(shot["name"], shot_name)
        self.assertEquals(shot["parent_id"], parent_id)
