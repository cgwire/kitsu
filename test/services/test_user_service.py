# -*- coding: UTF-8 -*-
from test.base import ApiDBTestCase

from zou.app.services import user_service, persons_service

from zou.app.utils import permissions


class TaskServiceTestCase(ApiDBTestCase):

    def setUp(self):
        super(TaskServiceTestCase, self).setUp()

        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_entity_type()
        self.generate_fixture_entity()
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
        super(TaskServiceTestCase, self).tearDown()
        persons_service.get_current_user = self.old_get_current_user

    def get_current_user(self):
        return self.user.serialize()

    def get_current_user_raw(self):
        return self.user

    def test_check_assigned(self):
        with self.assertRaises(permissions.PermissionDenied):
            user_service.check_assigned(self.task_id)
        self.task.assignees.append(self.user)
        self.task.save()
        self.assertTrue(user_service.check_assigned(self.task_id))

    def test_check_has_task_related(self):
        with self.assertRaises(permissions.PermissionDenied):
            user_service.check_has_task_related(self.project_id)
        self.task.assignees.append(self.user)
        self.task.save()
        self.assertTrue(user_service.check_has_task_related(self.project_id))

    def test_check_criterions_has_task_related(self):
        with self.assertRaises(permissions.PermissionDenied):
            user_service.check_criterions_has_task_related({})

        with self.assertRaises(permissions.PermissionDenied):
            user_service.check_criterions_has_task_related({
                "project_id": self.project_id
            })

        self.task.assignees.append(self.user)
        self.task.save()
        self.assertTrue(user_service.check_criterions_has_task_related({
            "project_id": self.project_id
        }))
