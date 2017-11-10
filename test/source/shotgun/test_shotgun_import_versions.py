from test.source.shotgun.base import ShotgunTestCase

from zou.app.models.task import Task
from zou.app.models.person import Person


class ImportShotgunVersionTestCase(ShotgunTestCase):

    def setUp(self):
        super(ImportShotgunVersionTestCase, self).setUp()

        self.load_fixture('persons')
        self.load_fixture('projects')
        self.load_fixture('status')
        self.load_fixture('steps')
        self.load_fixture('assets')
        self.load_fixture('sequences')
        self.load_fixture('shots')
        self.load_fixture('tasks')

    def test_import_preview_files(self):
        self.preview_files = self.load_fixture('versions')
        self.assertEqual(len(self.preview_files), 1)

        self.preview_files = self.get("data/preview-files")
        self.assertEqual(len(self.preview_files), 1)

    def test_import_preview_files_twice(self):
        self.preview_files = self.load_fixture('versions')
        self.preview_files = self.load_fixture('versions')
        self.assertEqual(len(self.preview_files), 1)

        self.preview_files = self.get("data/preview-files")
        self.assertEqual(len(self.preview_files), 1)

    def test_import_version(self):
        sg_version = {
            "code": "S01_Animation",
            "description": "description test",
            "id": 2,
            "user": {
                "id": 1,
                "name": "Jhon Doe",
                "type": "HumanUser"
            },
            "entity": {
                "id": 1,
                "name": "SH01",
                "type": "Shot"
            },
            "project": {
                "id": 1,
                "name": "Cosmos Landromat",
                "type": "Project"
            },
            "sg_task": {
                "id": 1,
                "name": "Animation",
                "type": "Task"
            },
            "sg_uploaded_movie": {
                "content_type": "video/mp4",
                "id": 1,
                "link_type": "upload",
                "name": "movie_new.mp4",
                "type": "Attachment",
                "url": "https://sg-media.amazonaws.com/9e73/movie_new.mp4"
            },
            "type": "Version"
        }

        api_path = "/import/shotgun/versions"
        self.preview_files = self.post(api_path, [sg_version], 200)
        self.assertEqual(len(self.preview_files), 1)

        self.preview_files = self.get("data/preview-files")
        self.assertEqual(len(self.preview_files), 1)
        preview_file = self.preview_files[0]

        task = Task.get_by(shotgun_id=sg_version["sg_task"]["id"])
        person = Person.get_by(shotgun_id=sg_version["user"]["id"])

        self.assertEqual(preview_file["name"], sg_version["code"])
        self.assertEqual(preview_file["source"], "Shotgun")
        self.assertEqual(preview_file["task_id"], str(task.id))

        self.assertEqual(preview_file["name"], sg_version["code"])
        self.assertEqual(preview_file["description"], sg_version["description"])
        self.assertEqual(preview_file["shotgun_id"], sg_version["id"])
        self.assertEqual(
            preview_file["uploaded_movie_url"],
            sg_version["sg_uploaded_movie"]["url"]
        )
        self.assertEqual(
            preview_file["uploaded_movie_url"],
            sg_version["sg_uploaded_movie"]["url"]
        )
        self.assertEqual(preview_file["person_id"], str(person.id))
