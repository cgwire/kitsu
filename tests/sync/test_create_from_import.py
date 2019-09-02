from tests.base import ApiDBTestCase

from zou.app.models.entity import Entity, EntityLink
from zou.app.models.news import News
from zou.app.models.project import Project
from zou.app.models.person import Person
from zou.app.models.playlist import Playlist
from zou.app.models.preview_file import PreviewFile
from zou.app.models.task import Task


class CreateFromImportTestCase(ApiDBTestCase):

    def setUp(self):
        super(CreateFromImportTestCase, self).setUp()
        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_asset_type()
        self.generate_fixture_asset_types()
        self.generate_fixture_asset()
        self.generate_fixture_episode()
        self.generate_fixture_sequence()
        self.generate_fixture_shot()
        self.generate_fixture_person()
        self.generate_fixture_assigner()
        self.generate_fixture_task_status()
        self.generate_fixture_department()
        self.generate_fixture_task_type()
        self.generate_fixture_task()
        self.generate_fixture_comment()

    def test_project(self):
        project_id = "d98a6269-e566-4e11-b29f-b3faa2039d79"
        project_name = "Caminandes"
        Project.create_from_import({
            "team": [
                str(self.person.id)
            ],
            "id": project_id,
            "created_at": "2019-06-20T12:28:16",
            "updated_at": "2019-08-30T12:48:09",
            "name": project_name,
            "has_avatar": True,
            "fps": "25",
            "production_type": "tvshow",
            "start_date": "2019-07-01",
            "end_date": "2021-12-31",
            "project_status_id": str(self.open_status.id),
            "type": "Project"
        })
        project = Project.get(project_id)
        self.assertEqual(project.name, project_name)

    def test_entity(self):
        entity_dict = {
            "id": "49ed2011-3186-4405-8dc8-d6cb3a68ff1c",
            "entities_out": [],
            "created_at": "2019-06-20T12:28:16",
            "updated_at": "2019-08-16T11:44:31",
            "name": "Lama",
            "description": "",
            "canceled": False,
            "project_id": str(self.project.id),
            "entity_type_id": str(self.asset_type_character.id),
            "preview_file_id": None,
            "entities_in": [],
            "type": "Asset"
        }
        Entity.create_from_import(entity_dict)
        entity = Entity.get(entity_dict["id"])
        self.assertEqual(entity_dict["name"], entity.name)

    def test_entity_link(self):
        entity_link_dict = {
            "id": "726f9b44-526f-4fce-a979-6bf8bc8962a4",
            "created_at": "2019-06-28T09:47:42",
            "updated_at": "2019-06-28T09:47:42",
            "entity_in_id": str(self.shot.id),
            "entity_out_id": str(self.asset.id),
            "nb_occurences": 1,
            "label": "animation",
            "type": "EntityLink"
        }
        EntityLink.create_from_import(entity_link_dict)
        entity_link = EntityLink.get_by(id=entity_link_dict["id"])
        self.assertEqual(entity_link_dict["label"], entity_link.label)

    def test_news(self):
        news_dict = {
            "id": "2b63ba4a-695f-4d4d-b13c-ecf3991e64b7",
            "type": "News",
            "author_id": str(self.person.id),
            "comment_id": self.comment["id"],
            "task_id": str(self.task.id),
            "task_type_id": str(self.task_type.id),
            "task_status_id": str(self.task_status.id),
            "task_entity_id": str(self.asset.id),
            "preview_file_id": None,
            "preview_file_extension": None,
            "project_id": str(self.project.id),
            "project_name": "Caminandes",
            "created_at": "2019-08-25T23:05:05",
            "change": True,
            "episode_id": None
        }
        News.create_from_import(news_dict)
        news = News.get(news_dict["id"])
        self.assertEqual(str(news.comment_id), self.comment["id"])

    def test_person(self):
        person_dict = {
            "skills": [ ],
            "id": "b86127df-909b-4bc2-983e-a959ea5a7319",
            "created_at": "2019-06-29T15:05:22",
            "updated_at": "2019-06-29T15:05:22",
            "first_name": "John",
            "last_name": "Doe",
            "email": "jhon01@gmail.com",
            "phone": "",
            "active": True,
            "desktop_login": "",
            "timezone": "Europe/Paris",
            "locale": "en_US",
            "role": "user",
            "has_avatar": True,
            "notifications_enabled": False,
            "notifications_slack_enabled": False,
            "notifications_slack_userid": None,
            "type": "Person",
            "full_name": "John Doe"
        }
        Person.create_from_import(person_dict)
        person = Person.get(person_dict["id"])
        self.assertEqual(person.first_name, person_dict["first_name"])

    def test_playlist(self):
        playlist_dict = {
            "build_jobs": [],
            "id": "36f6ab50-4e33-4da8-b853-2261d74fb64b",
            "created_at": "2019-08-06T11:11:02",
            "updated_at": "2019-08-06T13:11:02",
            "name": "2019-08-06 13:11:02 New playlist ",
            "shots": [],
            "project_id": str(self.project.id),
            "episode_id": str(self.episode.id),
            "type": "Playlist"
        }
        Playlist.create_from_import(playlist_dict)
        playlist = Playlist.get(playlist_dict["id"])
        self.assertEqual(playlist.name, playlist_dict["name"])

    def test_preview_file(self):
        preview_file_dict = {
            "id": "2b65b36d-a394-41f9-8415-9e92abeb0d49",
            "created_at": "2019-08-25T16:48:34",
            "updated_at": "2019-08-25T18:48:34",
            "name": "d7c1d6ec-b3e6",
            "original_name": "picture.png",
            "revision": 1,
            "source": "webgui",
            "extension": "png",
            "annotations": [],
            "task_id": str(self.task.id),
            "person_id": str(self.person.id),
            "source_file_id": None,
            "type": "PreviewFile",
            "comments": [
                self.comment["id"]
            ]
        }
        PreviewFile.create_from_import(preview_file_dict)
        preview_file = PreviewFile.get(preview_file_dict["id"])
        self.assertEqual(preview_file.name, preview_file_dict["name"])

    def test_task(self):
        task_dict = {
            "assignees": [str(self.person.id)],
            "id": "3629fc9f-355f-420e-b3c7-5d69f02888e6",
            "created_at": "2019-06-03T10:05:57",
            "updated_at": "2019-06-05T10:05:57",
            "name": "main",
            "priority": 2,
            "duration": 3,
            "estimation": 2,
            "completion_rate": 50,
            "retake_count": 1,
            "sort_order": 1,
            "real_start_date": "2019-06-04T10:05:57",
            "last_comment_date": "2019-06-05T10:05:57",
            "project_id": str(self.project.id),
            "task_type_id": str(self.task_type.id),
            "task_status_id": str(self.task_status.id),
            "entity_id": str(self.asset.id),
            "assigner_id": str(self.user["id"]),
            "type": "Task"
        }
        Task.create_from_import(task_dict)
        task = Task.get(task_dict["id"])
        self.assertEqual(task.name, task_dict["name"])

    """
    def test_notification(self):
        pass
    """
