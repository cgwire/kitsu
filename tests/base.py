import datetime
import unittest
import json
import os
import ntpath

from mixer.backend.flask import mixer

from zou.app import app
from zou.app.utils import fields, auth
from zou.app.services import (
    breakdown_service,
    file_tree_service,
    tasks_service
)

from zou.app.models.asset_instance import AssetInstance
from zou.app.models.department import Department
from zou.app.models.entity import Entity
from zou.app.models.entity_type import EntityType
from zou.app.models.file_status import FileStatus
from zou.app.models.metadata_descriptor import MetadataDescriptor
from zou.app.models.output_file import OutputFile
from zou.app.models.output_type import OutputType
from zou.app.models.project import Project
from zou.app.models.project_status import ProjectStatus
from zou.app.models.person import Person
from zou.app.models.preview_file import PreviewFile
from zou.app.models.task import Task
from zou.app.models.task_status import TaskStatus
from zou.app.models.task_type import TaskType
from zou.app.models.software import Software
from zou.app.models.working_file import WorkingFile


class ApiTestCase(unittest.TestCase):
    """
    Set of helpers to make test development easier.
    """

    def setUp(self):
        """
        Configure Flask application before each test.
        """
        app.test_request_context(headers={
            "mimetype": "application/json"
        })
        self.flask_app = app
        self.app = app.test_client()
        self.base_headers = {}
        self.post_headers = {"Content-type": "application/json"}
        from zou.app.utils import cache
        cache.clear()

    def log_in(self, email):
        tokens = self.post("auth/login", {
            "email": email,
            "password": "mypassword"
        }, 200)
        self.auth_headers = {
            "Authorization": "Bearer %s" % tokens["access_token"]
        }
        self.base_headers.update(self.auth_headers)
        self.post_headers.update(self.auth_headers)

    def log_in_admin(self):
        self.log_in(self.user["email"])

    def log_in_manager(self):
        self.log_in(self.user_manager["email"])

    def log_in_cg_artist(self):
        self.log_in(self.user_cg_artist["email"])

    def log_out(self):
        try:
            self.get("auth/logout")
        except AssertionError:
            pass

    def get(self, path, code=200):
        """
        Get data provided at given path. Format depends on the path.
        """
        response = self.app.get(path, headers=self.base_headers)
        self.assertEqual(response.status_code, code)
        return json.loads(response.data.decode("utf-8"))

    def get_raw(self, path, code=200):
        """
        Get data provided at given path. Format depends on the path. Do not
        parse the json.
        """
        response = self.app.get(path, headers=self.base_headers)
        self.assertEqual(response.status_code, code)
        return response.data.decode("utf-8")

    def get_first(self, path, code=200):
        """
        Get first element of data at given path. It makes the assumption that
        returned data is an array.
        """
        rows = self.get(path, code)
        return rows[0]

    def get_404(self, path):
        """
        Make sure that given path returns a 404 error for GET requests.
        """
        response = self.app.get(path, headers=self.base_headers)
        self.assertEqual(response.status_code, 404)

    def post(self, path, data, code=201):
        """
        Run a post request at given path while making sure it sends data at JSON
        format.
        """
        clean_data = fields.serialize_value(data)
        response = self.app.post(
            path,
            data=json.dumps(clean_data),
            headers=self.post_headers
        )
        if (response.status_code == 500):
            print(response.data)
        self.assertEqual(response.status_code, code)
        return json.loads(response.data.decode("utf-8"))

    def post_404(self, path, data):
        """
        Make sure that given path returns a 404 error for POST requests.
        """
        response = self.app.post(
            path,
            data=json.dumps(data),
            headers=self.post_headers
        )
        self.assertEqual(response.status_code, 404)

    def put(self, path, data, code=200):
        """
        Run a put request at given path while making sure it sends data at JSON
        format.
        """
        response = self.app.put(
            path,
            data=json.dumps(data),
            headers=self.post_headers
        )
        self.assertEqual(response.status_code, code)
        return json.loads(response.data.decode("utf-8"))

    def put_404(self, path, data):
        """
        Make sure that given path returns a 404 error for PUT requests.
        """
        response = self.app.put(
            path,
            data=json.dumps(data),
            headers=self.post_headers
        )
        self.assertEqual(response.status_code, 404)

    def delete(self, path, code=204):
        """
        Run a delete request at given path.
        """
        response = self.app.delete(path, headers=self.base_headers)
        self.assertEqual(response.status_code, code)
        return response.data

    def delete_404(self, path):
        """
        Make sure that given path returns a 404 error for DELETE requests.
        """
        response = self.app.get(path, headers=self.base_headers)
        self.assertEqual(response.status_code, 404)

    def upload_file(self, path, file_path, code=201):
        """
        Upload a file at given path. File data are sent in the request body.
        """
        file_content = open(file_path, "rb")
        file_name = ntpath.basename(file_path)
        response = self.app.post(
            path,
            data={"file": (file_content, file_name)},
            headers=self.base_headers
        )
        self.assertEqual(response.status_code, code)
        return response.data

    def download_file(self, path, target_file_path, code=200):
        """
        Download a file located at given url path and save it at given file
        path.
        """
        response = self.app.get(path, headers=self.base_headers)
        self.assertEqual(response.status_code, code)
        file_descriptor = open(target_file_path, "wb")
        file_descriptor.write(response.data)
        return open(target_file_path, "rb").read()

    def tearDown(self):
        pass


class ApiDBTestCase(ApiTestCase):

    def setUp(self):
        """
        Reset database before each test.
        """
        super(ApiDBTestCase, self).setUp()

        from zou.app.utils import dbhelpers
        dbhelpers.drop_all()
        dbhelpers.create_all()
        self.generate_fixture_user()
        self.log_in_admin()

    def tearDown(self):
        """
        Delete database after each test.
        """
        from zou.app.utils import dbhelpers
        dbhelpers.drop_all()

    def generate_data(self, cls, number, **kwargs):
        """
        Generate random data for a given data model.
        """
        mixer.init_app(self.flask_app)
        return mixer.cycle(number).blend(
            cls,
            id=fields.gen_uuid,
            **kwargs
        )

    def generate_fixture_project_status(self):
        self.open_status = ProjectStatus.create(name="Open", color="#FFFFFF")

    def generate_fixture_project_closed_status(self):
        self.closed_status = ProjectStatus.create(
            name="closed", color="#FFFFFF")

    def generate_fixture_project(self, name="Cosmos Landromat"):
        self.project = Project.create(
            name=name,
            project_status_id=self.open_status.id
        )
        self.project_id = self.project.id
        self.project.update({
            "file_tree": file_tree_service.get_tree_from_file("simple")
        })
        return self.project

    def generate_fixture_project_closed(self):
        self.project_closed = Project.create(
            name="Old Project",
            project_status_id=self.closed_status.id
        )

    def generate_fixture_project_standard(self):
        self.project_standard = Project.create(
            name="Big Buck Bunny",
            project_status_id=self.open_status.id
        )
        self.project_standard.update({
            "file_tree": file_tree_service.get_tree_from_file("default")
        })

    def generate_fixture_project_no_preview_tree(self):
        self.project_no_preview_tree = Project.create(
            name="Agent 327",
            project_status_id=self.open_status.id
        )
        self.project_no_preview_tree.update({
            "file_tree": file_tree_service.get_tree_from_file("no_preview")
        })

    def generate_fixture_asset(
        self,
        name="Tree",
        description="Description Tree"
    ):
        self.asset = Entity.create(
            name=name,
            description=description,
            project_id=self.project.id,
            entity_type_id=self.asset_type.id
        )
        return self.asset

    def generate_fixture_asset_character(
        self,
        name="Rabbit",
        description="Main char"
    ):
        self.asset_character = Entity.create(
            name=name,
            description=description,
            project_id=self.project.id,
            entity_type_id=self.asset_type_character.id
        )

    def generate_fixture_asset_camera(self):
        self.asset_camera = Entity.create(
            name="Main camera",
            description="Description Camera",
            project_id=self.project.id,
            entity_type_id=self.asset_type_camera.id
        )

    def generate_fixture_asset_standard(self):
        self.asset_standard = Entity.create(
            name="Car",
            project_id=self.project_standard.id,
            entity_type_id=self.asset_type.id
        )

    def generate_fixture_sequence(
        self,
        name="S01",
        episode_id=None,
        project_id=None
    ):
        if episode_id is None and hasattr(self, "episode"):
            episode_id = self.episode.id

        if project_id is None:
            project_id = self.project.id

        self.sequence = Entity.create(
            name=name,
            project_id=project_id,
            entity_type_id=self.sequence_type.id,
            parent_id=episode_id
        )
        return self.sequence

    def generate_fixture_sequence_standard(self):
        self.sequence_standard = Entity.create(
            name="S01",
            project_id=self.project_standard.id,
            entity_type_id=self.sequence_type.id
        )
        return self.sequence_standard

    def generate_fixture_episode(self, name="E01", project_id=None):
        if project_id is None:
            project_id = self.project.id
        self.episode = Entity.create(
            name=name,
            project_id=project_id,
            entity_type_id=self.episode_type.id
        )
        return self.episode

    def generate_fixture_shot(self, name="P01"):
        self.shot = Entity.create(
            name=name,
            description="Description Shot 01",
            data={
                "fps": 25,
                "frame_in": 0,
                "frame_out": 100
            },
            project_id=self.project.id,
            entity_type_id=self.shot_type.id,
            parent_id=self.sequence.id
        )
        return self.shot

    def generate_fixture_scene(
        self,
        name="SC01",
        project_id=None,
        sequence_id=None
    ):
        if project_id is None:
            project_id = self.project.id

        if sequence_id is None:
            sequence_id = self.sequence.id

        self.scene = Entity.create(
            name=name,
            description="Description Scene 01",
            data={},
            project_id=project_id,
            entity_type_id=self.scene_type.id,
            parent_id=self.sequence.id
        )
        return self.scene

    def generate_fixture_shot_standard(self, name="SH01"):
        self.shot_standard = Entity.create(
            name=name,
            description="Description Shot 01",
            data={
                "fps": 25,
                "frame_in": 0,
                "frame_out": 100
            },
            project_id=self.project_standard.id,
            entity_type_id=self.shot_type.id,
            parent_id=self.sequence_standard.id
        )
        return self.shot_standard

    def generate_fixture_shot_asset_instance(
        self,
        shot,
        asset_instance,
        number=1
    ):
        self.shot.instance_casting.append(asset_instance)
        self.shot.save()
        return self.shot

    def generate_fixture_scene_asset_instance(
        self,
        asset=None,
        scene=None,
        number=1
    ):
        if asset is None:
            asset = self.asset
        if scene is None:
            scene = self.scene
        self.asset_instance = AssetInstance.create(
            asset_id=asset.id,
            scene_id=scene.id,
            number=number,
            name=breakdown_service.build_asset_instance_name(
                self.asset.id, number
            ),
            description="Asset instance description"
        )
        return self.asset_instance

    def generate_fixture_asset_asset_instance(
        self,
        asset=None,
        target_asset=None,
        number=1
    ):
        if asset is None:
            asset = self.asset_character
        if target_asset is None:
            target_asset = self.asset
        self.asset_instance = AssetInstance.create(
            asset_id=asset.id,
            target_asset_id=target_asset.id,
            number=number,
            name=breakdown_service.build_asset_instance_name(
                asset.id, number
            ),
            description="Asset instance description"
        )
        return self.asset_instance

    def generate_fixture_user(self):
        self.user = Person.create(
            first_name="John",
            last_name="Did",
            role="admin",
            email=u"john.did@gmail.com",
            password=auth.encrypt_password("mypassword")
        ).serialize()
        return self.user

    def generate_fixture_user_manager(self):
        self.user_manager = Person.create(
            first_name="John",
            last_name="Did2",
            role="manager",
            email=u"john.did.manager@gmail.com",
            password=auth.encrypt_password("mypassword")
        ).serialize()
        return self.user_manager

    def generate_fixture_user_cg_artist(self):
        self.user_cg_artist = Person.create(
            first_name="John",
            last_name="Did3",
            email=u"john.did.cg.artist@gmail.com",
            role="user",
            password=auth.encrypt_password("mypassword")
        ).serialize()
        return self.user_cg_artist

    def generate_fixture_person(
        self,
        first_name="John",
        last_name="Doe",
        desktop_login="john.doe",
        email="john.doe@gmail.com"
    ):
        self.person = Person.create(
            first_name=first_name,
            last_name=last_name,
            desktop_login=desktop_login,
            email=email,
            password=auth.encrypt_password("mypassword")
        )
        return self.person

    def generate_fixture_asset_type(self):
        self.asset_type = EntityType.create(name="Props")
        self.shot_type = EntityType.create(name="Shot")
        self.sequence_type = EntityType.create(name="Sequence")
        self.episode_type = EntityType.create(name="Episode")
        self.scene_type = EntityType.create(name="Scene")

    def generate_fixture_asset_types(self):
        self.asset_type_character = EntityType.create(name="Character")
        self.asset_type_environment = EntityType.create(name="Environment")
        self.asset_type_camera = EntityType.create(name="Camera")

    def generate_fixture_department(self):
        self.department = Department.create(name="Modeling", color="#FFFFFF")
        self.department_animation = Department.create(
            name="Animation",
            color="#FFFFFF"
        )

    def generate_fixture_task_type(self):
        self.task_type = TaskType.create(
            name="Shaders",
            short_name="shd",
            color="#FFFFFF",
            department_id=self.department.id
        )
        self.task_type_animation = TaskType.create(
            name="Animation",
            short_name="anim",
            color="#FFFFFF",
            department_id=self.department_animation.id
        )

    def generate_fixture_task_status(self):
        self.task_status = TaskStatus.create(
            name="Open",
            short_name="opn",
            color="#FFFFFF"
        )

    def generate_fixture_task_status_wip(self):
        self.task_status_wip = TaskStatus.create(
            name="WIP",
            short_name="wip",
            color="#FFFFFF"
        )

    def generate_fixture_task_status_to_review(self):
        self.task_status_to_review = TaskStatus.create(
            name="To review",
            short_name="pndng",
            color="#FFFFFF"
        )

    def generate_fixture_task_status_retake(self):
        self.task_status_retake = TaskStatus.create(
            name="Retake",
            short_name="rtk",
            color="#FFFFFF",
            is_retake=True
        )

    def generate_fixture_task_status_done(self):
        self.task_status_done = TaskStatus.create(
            name="Done",
            short_name="done",
            color="#FFFFFF",
            is_done=True
        )

    def generate_fixture_assigner(self):
        self.assigner = Person.create(first_name="Ema", last_name="Peel")

    def generate_fixture_task(self, name="Master", asset_id=None):
        if asset_id is None:
            asset_id = self.asset.id

        start_date = fields.get_date_object("2017-02-20")
        due_date = fields.get_date_object("2017-02-28")
        real_start_date = fields.get_date_object("2017-02-22")
        self.task = Task.create(
            name=name,
            project_id=self.project.id,
            task_type_id=self.task_type.id,
            task_status_id=self.task_status.id,
            entity_id=asset_id,
            assignees=[self.person],
            assigner_id=self.assigner.id,
            duration=50,
            estimation=40,
            start_date=start_date,
            due_date=due_date,
            real_start_date=real_start_date
        )
        self.task_id = self.task.id
        self.project.team.append(self.person)
        self.project.save()
        return self.task

    def generate_fixture_task_standard(self):
        start_date = fields.get_date_object("2017-02-20")
        due_date = fields.get_date_object("2017-02-28")
        real_start_date = fields.get_date_object("2017-02-22")
        self.task_standard = Task.create(
            name="Super modeling",
            project_id=self.project_standard.id,
            task_type_id=self.task_type.id,
            task_status_id=self.task_status.id,
            entity_id=self.asset_standard.id,
            assignees=[self.person],
            assigner_id=self.assigner.id,
            duration=50,
            estimation=40,
            start_date=start_date,
            due_date=due_date,
            real_start_date=real_start_date
        )
        self.project.team.append(self.person)
        self.project.save()
        return self.task_standard

    def generate_fixture_shot_task(self, name="Master"):
        self.shot_task = Task.create(
            name=name,
            project_id=self.project.id,
            task_type_id=self.task_type_animation.id,
            task_status_id=self.task_status.id,
            entity_id=self.shot.id,
            assignees=[self.person],
            assigner_id=self.assigner.id,
        )
        self.project.team.append(self.person)
        self.project.save()
        return self.shot_task

    def generate_fixture_scene_task(self, name="Master"):
        self.scene_task = Task.create(
            name=name,
            project_id=self.project.id,
            task_type_id=self.task_type_animation.id,
            task_status_id=self.task_status.id,
            entity_id=self.scene.id,
            assignees=[self.person],
            assigner_id=self.assigner.id,
        )
        self.project.team.append(self.person)
        self.project.save()
        return self.scene_task

    def generate_fixture_sequence_task(self, name="Master"):
        self.sequence_task = Task.create(
            name=name,
            project_id=self.project.id,
            task_type_id=self.task_type_animation.id,
            task_status_id=self.task_status.id,
            entity_id=self.sequence.id,
            assignees=[self.person],
            assigner_id=self.assigner.id,
        )
        self.project.team.append(self.person)
        self.project.save()
        return self.sequence_task

    def generate_fixture_shot_task_standard(self):
        self.shot_task_standard = Task.create(
            name="Super animation",
            project_id=self.project_standard.id,
            task_type_id=self.task_type_animation.id,
            task_status_id=self.task_status.id,
            entity_id=self.shot_standard.id,
            assignees=[self.person],
            assigner_id=self.assigner.id
        )
        self.project.team.append(self.person)
        self.project.save()
        return self.shot_task_standard

    def generate_fixture_comment(self):
        self.comment = tasks_service.create_comment(
            self.task.id,
            self.task_status.id,
            self.person.id,
            "first comment"
        )
        return self.comment

    def generate_fixture_file_status(self):
        self.file_status = FileStatus.create(
            name="To review",
            color="#FFFFFF"
        )

    def generate_fixture_working_file(self, name="main", revision=1):
        self.working_file = WorkingFile.create(
            name=name,
            comment="",
            revision=revision,
            task_id=self.task.id,
            entity_id=self.asset.id,
            person_id=self.person.id,
            software_id=self.software.id
        )
        return self.working_file

    def generate_fixture_shot_working_file(self):
        self.working_file = WorkingFile.create(
            name="main",
            comment="",
            revision=1,
            task_id=self.shot_task.id,
            entity_id=self.shot.id,
            person_id=self.person.id,
            software_id=self.software.id
        )

    def generate_fixture_output_file(
        self,
        output_type=None,
        revision=1,
        name="main",
        representation="",
        asset_instance=None,
        temporal_entity_id=None,
        task=None
    ):
        if output_type is None:
            output_type = self.output_type

        if task is None:
            task_type_id = self.task_type.id
            asset_id = self.asset.id
        else:
            task_type_id = task.task_type_id
            asset_id = task.entity_id

        if asset_instance is None:
            asset_instance_id = None
        else:
            asset_instance_id = asset_instance.id
            if temporal_entity_id is None:
                temporal_entity_id = self.scene.id

        self.output_file = OutputFile.create(
            comment="",
            revision=revision,
            task_type_id=task_type_id,
            entity_id=asset_id,
            person_id=self.person.id,
            file_status_id=self.file_status.id,
            output_type_id=output_type.id,
            asset_instance_id=asset_instance_id,
            representation=representation,
            temporal_entity_id=temporal_entity_id,
            name=name
        )
        return self.output_file

    def generate_fixture_output_type(self, name="Geometry", short_name="Geo"):
        self.output_type = OutputType.create(
            name=name,
            short_name=short_name
        )
        return self.output_type

    def generate_fixture_software(self):
        self.software = Software.create(
            name="Blender",
            short_name="bdr",
            file_extension=".blender"
        )
        self.software_max = Software.create(
            name="3dsMax",
            short_name="max",
            file_extension=".max"
        )

    def generate_fixture_preview_file(self, revision=1):
        self.preview_file = PreviewFile.create(
            name="main",
            revision=revision,
            description="test description",
            source="pytest",
            task_id=self.task.id,
            person_id=self.person.id
        )
        return self.preview_file

    def get_fixture_file_path(self, relative_path):
        current_path = os.getcwd()
        file_path_fixture = os.path.join(
            current_path,
            "tests",
            "fixtures",
            relative_path
        )
        return file_path_fixture

    def generate_fixture_metadata_descriptor(self, entity_type="Asset"):
        self.meta_descriptor = MetadataDescriptor.create(
            project_id=self.project.id,
            name="Contractor",
            field_name="contractor",
            choices=["value 1", "value 2"],
            entity_type=entity_type
        )
        return self.meta_descriptor

    def generate_assigned_task(self):
        self.generate_fixture_asset()
        self.generate_fixture_department()
        self.generate_fixture_task_type()
        self.generate_fixture_task_status()
        self.generate_fixture_person()
        self.generate_fixture_assigner()
        self.generate_fixture_task()

    def generate_shot_suite(self):
        self.generate_fixture_asset_type()
        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_episode()
        self.generate_fixture_sequence()
        self.generate_fixture_shot()
        self.generate_fixture_scene()

    def now(self):
        return datetime.datetime.now().replace(microsecond=0).isoformat()
