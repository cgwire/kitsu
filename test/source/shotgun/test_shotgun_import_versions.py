from test.source.shotgun.base import ShotgunTestCase

from zou.app.models.entity import Entity
from zou.app.models.task import Task
from zou.app.models.person import Person
from zou.app.models.file_status import FileStatus

from zou.app.config import DEFAULT_FILE_STATUS

from zou.app.project import shot_info


class ImportShotgunVersionTestCase(ShotgunTestCase):

    def setUp(self):
        super(ImportShotgunVersionTestCase, self).setUp()

        self.load_fixture('persons')
        self.load_fixture('projects')
        self.load_fixture('status')
        self.load_fixture('steps')
        self.load_fixture('assets')
        self.load_fixture('shots')
        self.load_fixture('tasks')

    def test_import_output_files(self):
        self.output_files = self.load_fixture('versions')
        self.assertEqual(len(self.output_files), 1)

        self.output_files = self.get("data/output_files")
        self.assertEqual(len(self.output_files), 1)

    def test_import_output_files_twice(self):
        self.output_files = self.load_fixture('versions')
        self.output_files = self.load_fixture('versions')
        self.assertEqual(len(self.output_files), 1)

        self.output_files = self.get("data/output_files")
        self.assertEqual(len(self.output_files), 1)

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

        api_path = "data/import/shotgun/versions"
        self.output_files = self.post(api_path, [sg_version], 200)
        self.assertEqual(len(self.output_files), 1)

        self.output_files = self.get("data/output_files")
        self.assertEqual(len(self.output_files), 1)
        output_file = self.output_files[0]

        task = Task.get_by(shotgun_id=sg_version["sg_task"]["id"])
        person = Person.get_by(shotgun_id=sg_version["user"]["id"])
        entity = Entity.get_by(
            shotgun_id=sg_version["entity"]["id"],
            entity_type_id=shot_info.get_shot_type().id
        )
        file_status = FileStatus.get_by(name=DEFAULT_FILE_STATUS)

        self.assertEqual(output_file["name"], sg_version["code"])
        self.assertEqual(output_file["source"], "Shotgun")
        self.assertEqual(output_file["entity_id"], str(entity.id))
        self.assertEqual(output_file["task_id"], str(task.id))

        self.assertEqual(output_file["name"], sg_version["code"])
        self.assertEqual(output_file["description"], sg_version["description"])
        self.assertEqual(output_file["shotgun_id"], sg_version["id"])
        self.assertEqual(
            output_file["uploaded_movie_url"],
            sg_version["sg_uploaded_movie"]["url"]
        )
        self.assertEqual(
            output_file["uploaded_movie_url"],
            sg_version["sg_uploaded_movie"]["url"]
        )
        self.assertEqual(output_file["person_id"], str(person.id))
        self.assertEqual(output_file["file_status_id"], str(file_status.id))
