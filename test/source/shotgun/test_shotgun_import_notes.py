from test.source.shotgun.base import ShotgunTestCase

from zou.app.models.person import Person
from zou.app.models.task import Task


class ImportShotgunTaskTestCase(ShotgunTestCase):

    def setUp(self):
        super(ImportShotgunTaskTestCase, self).setUp()
        self.load_fixture('persons')
        self.load_fixture('projects')
        self.load_fixture('status')
        self.load_fixture('steps')
        self.load_fixture('assets')
        self.load_fixture('shots')
        self.load_fixture('tasks')

    def load_note(self):
        self.sg_note = {
            "project": {
                "type": "Project",
                "id": 1,
                "name": "Cosmos Landromat"
            },
            "tasks": [{
                "type": "Task",
                "id": 1,
                "name": "Animation"
            }],
            "note_links": [{
                    "type": "Shot",
                    "id": 1,
                    "name": "SH01"
                }, {
                    "type": "Version",
                    "id": 1,
                    "name": "SH01_Animation"
                }
            ],
            "updated_by": {
                "type": "HumanUser",
                "id": 1,
                "name": "Jhon Doe"
            },
            "created_at": "2016-12-05T15:06:34+01:00",
            "updated_at": "2016-12-14T10:33:03+01:00",
            "created_by": {
                "type": "HumanUser",
                "id": 1,
                "name": "Jhon Doe"
            },
            "content": "comment 01",
            "user": {
              "type": "HumanUser",
              "id": 1,
              "name": "John Doe"
            },
            "replies": [],
            "sg_status_list": "clsd",
            "type": "Note",
            "id": 1,
            "reply_content": "Test reply content."
        }

        api_path = "data/import/shotgun/notes"
        self.notes = self.post(api_path, [self.sg_note], 200)

    def test_import_note(self):
        self.load_note()
        self.assertEqual(len(self.notes), 1)

        self.comments = self.get("data/comments")
        self.assertEqual(len(self.comments), 1)

        note = self.comments[0]
        task = Task.get_by(shotgun_id=self.sg_note["tasks"][0]["id"])
        person = Person.get_by(shotgun_id=self.sg_note["user"]["id"])

        self.assertEqual(note["text"], self.sg_note["content"])
        self.assertEqual(note["object_type"], "Task")
        self.assertEqual(note["shotgun_id"], self.sg_note["id"])
        self.assertEqual(note["object_id"], str(task.id))
        self.assertEqual(note["person_id"], str(person.id))
        self.assertEqual(
            note["created_at"][:19],
            self.sg_note["created_at"][:19]
        )

    def test_import_remove_note(self):
        self.load_note()
        api_path = "data/import/shotgun/remove/note"
        sg_note = {"id": self.sg_note["id"]}
        self.notes = self.get(
            "data/comments?shotgun_id=%s" % self.sg_note["id"])
        note = self.notes[0]

        response = self.post(api_path, sg_note, 200)
        self.assertEqual(response["removed_instance_id"], note["id"])
        self.notes = self.get(
            "data/comments?shotgun_id=%s" % self.sg_note["id"])
        self.assertEqual(len(self.notes), 0)
