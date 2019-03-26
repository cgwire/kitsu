# -*- coding: UTF-8 -*-
from tests.base import ApiDBTestCase

from zou.app.models.person import Person
from zou.app.services import user_service, persons_service

from zou.app.utils import permissions


class UserServiceTestCase(ApiDBTestCase):

    def setUp(self):
        super(UserServiceTestCase, self).setUp()

        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_asset_type()
        self.generate_fixture_asset()
        self.generate_fixture_sequence()
        self.generate_fixture_shot()
        self.generate_fixture_department()
        self.generate_fixture_task_type()
        self.generate_fixture_task_status()
        self.generate_fixture_task_status_wip()
        self.generate_fixture_task_status_to_review()
        self.generate_fixture_person()
        self.generate_fixture_assigner()
        self.generate_fixture_task()
        self.generate_fixture_shot_task()
        self.generate_fixture_file_status()
        self.generate_fixture_software()
        self.generate_fixture_working_file()
        self.generate_fixture_output_type()
        self.generate_fixture_output_file()

        self.task_id = self.task.id
        self.project_id = self.project.id
        self.open_status_id = self.task_status.id
        self.wip_status_id = self.task_status_wip.id
        self.to_review_status_id = self.task_status_to_review.id

        self.old_get_current_user = persons_service.get_current_user
        persons_service.get_current_user = self.get_current_user
        self.old_get_current_user_raw = persons_service.get_current_user_raw
        persons_service.get_current_user_raw = self.get_current_user_raw

    def tearDown(self):
        super(UserServiceTestCase, self).tearDown()
        persons_service.get_current_user = self.old_get_current_user
        persons_service.get_current_user_raw = self.old_get_current_user_raw

    def get_current_user(self):
        return self.user

    def get_current_user_raw(self):
        return Person.get(self.user["id"])

    def test_check_project_access(self):
        from zou.app import app
        with app.app_context():
            self.generate_fixture_user_cg_artist()
            self.log_in_cg_artist()
            with self.assertRaises(permissions.PermissionDenied):
                user_service.check_project_access(self.project_id)

            self.project.team.append(self.get_current_user_raw())
            self.project.save()
            self.assertTrue(
                user_service.check_project_access(self.project_id))

    def test_related_projects(self):
        projects = user_service.related_projects()
        self.assertEqual(len(projects), 0)

        self.project.team.append(self.get_current_user_raw())

        self.project.save()
        projects = user_service.related_projects()
        self.assertEqual(len(projects), 1)
        self.assertEqual(projects[0]["id"], str(self.project_id))
