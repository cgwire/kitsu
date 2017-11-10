import pytest

from test.base import ApiDBTestCase

from zou.app.services import entities_service, assets_service

from zou.app.services.exception import (
    PreviewFileNotFoundException,
    EntityNotFoundException
)


class ToReviewHandler(object):

    def __init__(self, open_status_id, to_review_status_id):
        self.is_event_fired = False
        self.open_status_id = open_status_id
        self.to_review_status_id = to_review_status_id

    def handle_event(self, data):
        self.is_event_fired = True
        self.data = data


class EntityServiceTestCase(ApiDBTestCase):

    def setUp(self):
        super(EntityServiceTestCase, self).setUp()

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
        self.generate_fixture_preview_file()

    def test_set_main_preview(self):
        entities_service.update_entity_preview(
            self.entity.id,
            self.preview_file.id
        )
        asset = assets_service.get_asset(self.entity.id)
        self.assertEquals(asset.preview_file_id, self.preview_file.id)

        with pytest.raises(EntityNotFoundException):
            entities_service.update_entity_preview(
                self.preview_file.id,
                self.preview_file.id
            )

        with pytest.raises(PreviewFileNotFoundException):
            entities_service.update_entity_preview(
                self.entity.id,
                self.entity.id
            )
