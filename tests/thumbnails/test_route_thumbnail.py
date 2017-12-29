import os

from tests.base import ApiDBTestCase

from zou.app.utils import fs, thumbnail
from zou.app.services import assets_service
from zou.app.models.entity import Entity
from zou.app.models.project import Project

from PIL import Image

TEST_FOLDER = os.path.join("tests", "tmp")


class RouteThumbnailTestCase(ApiDBTestCase):

    def setUp(self):
        super(RouteThumbnailTestCase, self).setUp()

        self.delete_thumbnail_folders()
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
        self.generate_fixture_person()
        self.generate_fixture_assigner()
        self.generate_fixture_task()
        self.generate_fixture_software()
        self.generate_fixture_working_file()
        self.generate_fixture_preview_file()
        self.asset_id = self.asset.id
        self.preview_file_id = self.preview_file.id

    def tearDown(self):
        super(RouteThumbnailTestCase, self).tearDown()

        self.delete_thumbnail_folders()

    def delete_thumbnail_folders(self):
        fs.rm_rf(TEST_FOLDER)

    def test_add_thumbnail(self):
        path = "/pictures/thumbnails/persons/%s" % self.person.id

        file_path_fixture = self.get_fixture_file_path(
                os.path.join("thumbnails", "th01.png"))
        self.upload_file(path, file_path_fixture)

        path = "/pictures/thumbnails/persons/%s.png" % self.person.id
        current_path = os.path.dirname(__file__)
        result_file_path = os.path.join(TEST_FOLDER, "th01.png")
        result_file_path = os.path.join(
            current_path, "..", "..", result_file_path)

        os.mkdir(TEST_FOLDER)
        self.download_file(path, result_file_path)
        result_image = Image.open(result_file_path)

        self.assertEqual(result_image.size, thumbnail.RECTANGLE_SIZE)

    def test_add_preview(self):
        path = "/pictures/preview-files/%s" % self.preview_file_id

        file_path_fixture = self.get_fixture_file_path(
                os.path.join("thumbnails", "th01.png"))
        self.upload_file(path, file_path_fixture)

        current_path = os.path.dirname(__file__)
        result_file_path = os.path.join(TEST_FOLDER, "th01.png")
        result_file_path = os.path.join(
            current_path, "..", "..", result_file_path)
        os.mkdir(TEST_FOLDER)

        path = "/pictures/previews/preview-files/%s.png" % self.preview_file_id
        self.download_file(path, result_file_path)
        result_image = Image.open(result_file_path)
        self.assertEqual(result_image.size, (1200, 674))

        path = "/pictures/thumbnails/preview-files/%s.png" % \
            self.preview_file_id
        self.download_file(path, result_file_path)
        result_image = Image.open(result_file_path)
        self.assertEqual(result_image.size, (150, 100))

        path = \
            "/pictures/thumbnails-square/preview-files/%s.png" % \
            self.preview_file_id
        self.download_file(path, result_file_path)
        result_image = Image.open(result_file_path)
        self.assertEqual(result_image.size, (100, 100))

    def test_set_main_preview(self):
        path = "/pictures/preview-files/%s" % self.preview_file_id

        file_path_fixture = self.get_fixture_file_path(
                os.path.join("thumbnails", "th01.png"))
        self.upload_file(path, file_path_fixture)

        self.put("/actions/entities/%s/set-main-preview/%s" % (
            self.asset_id,
            self.preview_file_id
        ), {})

        asset = assets_service.get_asset(self.asset_id)
        self.assertEquals(
            asset["preview_file_id"],
            str(self.preview_file_id)
        )

        self.put("/actions/entities/%s/set-main-preview/%s" % (
            self.preview_file_id,
            self.preview_file_id
        ), {}, 404)

        self.put("/actions/entities/%s/set-main-preview/%s" % (
            self.asset_id,
            self.asset_id
        ), {}, 404)
        entity = Entity.get(self.asset_id)
        entity.preview_file_id = None
        entity.save()
