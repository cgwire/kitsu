from test.source.shotgun.base import ShotgunTestCase

from zou.app.models.project import Project
from zou.app.models.entity import Entity


class ImportShotgunSequence(ShotgunTestCase):

    def setUp(self):
        super(ImportShotgunSequence, self).setUp()
        self.generate_fixture_entity_type()

    def test_import_sequences(self):
        self.load_fixture('projects')
        self.sequences = self.load_fixture('sequences')
        self.assertEqual(len(self.sequences), 3)

        self.sequences = self.get("data/sequences")
        self.assertEqual(len(self.sequences), 3)

    def test_import_sequences_twice(self):
        self.load_fixture('projects')
        self.sequences = self.load_fixture('sequences')
        self.sequences = self.load_fixture('sequences')
        self.assertEqual(len(self.sequences), 3)

        self.sequences = self.get("data/sequences")
        self.assertEqual(len(self.sequences), 3)

    def test_import_sequence(self):
        self.load_fixture('projects')
        self.load_fixture('episodes')
        sg_sequence = {
            "project": {
                "type": "Project",
                "id": 1,
                "name": "Agent327"
            },
            "sg_episode": {
                "type": "Episode",
                "id": 1,
                "name": "E01"
            },
            "code": "S04",
            "type": "Sequence",
            "id": 4,
            "description": "test description"
        }
        api_path = "/import/shotgun/sequences"
        self.sequences = self.post(api_path, [sg_sequence], 200)
        self.assertEqual(len(self.sequences), 1)

        self.sequences = self.get("data/sequences")
        self.assertEqual(len(self.sequences), 1)

        sequence = self.sequences[0]
        project = Project.get_by(name="Agent327")
        episode = Entity.get_by(name="E01")
        self.assertEqual(sequence["name"], sg_sequence["code"])
        self.assertEqual(sequence["description"], sg_sequence["description"])
        self.assertEqual(sequence["shotgun_id"], sg_sequence["id"])
        self.assertEqual(sequence["project_id"], str(project.id))
        self.assertEqual(sequence["parent_id"], str(episode.id))
