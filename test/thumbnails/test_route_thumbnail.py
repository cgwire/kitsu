import os

from test.base import ApiDBTestCase

from zou.app.utils import fs, thumbnail

from PIL import Image


class RouteThumbnailTestCase(ApiDBTestCase):

    def setUp(self):
        super(RouteThumbnailTestCase, self).setUp()

        self.delete_thumbnail_folders()
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
        self.generate_fixture_person()
        self.generate_fixture_assigner()
        self.generate_fixture_task()
        self.generate_fixture_software()
        self.generate_fixture_working_file()
        self.generate_fixture_preview_file()

    def tearDown(self):
        super(RouteThumbnailTestCase, self).tearDown()

        self.delete_thumbnail_folders()

    def delete_thumbnail_folders(self):
        fs.rm_rf("test/tmp")
        fs.rm_rf("thumbnails")

    def test_add_thumbnail(self):
        path = "/pictures/thumbnails/shots/%s" % self.shot.id

        file_path_fixture = self.get_fixture_file_path(
                os.path.join("thumbnails", "th01.png"))
        self.upload_file(path, file_path_fixture)

        path = "/pictures/thumbnails/shots/%s.png" % self.shot.id
        current_path = os.path.dirname(__file__)
        result_file_path = "test/tmp/th01.png"
        result_file_path = os.path.join(
            current_path, "..", "..", result_file_path)

        os.mkdir("test/tmp")
        self.download_file(path, result_file_path)
        result_image = Image.open(result_file_path)

        self.assertEqual(result_image.size, thumbnail.RECTANGLE_SIZE)

    def test_add_thumbnail_working_file(self):
        path = "/pictures/thumbnails/working-files/%s" % self.working_file.id

        file_path_fixture = self.get_fixture_file_path(
            os.path.join("thumbnails", "th01.png")
        )
        self.upload_file(path, file_path_fixture)

        path = "/pictures/thumbnails/working-files/%s.png" \
               % self.working_file.id
        current_path = os.path.dirname(__file__)
        result_file_path = "test/tmp/th01.png"
        result_file_path = os.path.join(
            current_path, "..", "..", result_file_path)

        os.mkdir("test/tmp")
        self.download_file(path, result_file_path)
        result_image = Image.open(result_file_path)

        self.assertEqual(result_image.size, thumbnail.RECTANGLE_SIZE)

    def test_add_preview(self):
        path = "/pictures/preview-files/%s" % self.preview.id

        file_path_fixture = self.get_fixture_file_path(
                os.path.join("thumbnails", "th01.png"))
        self.upload_file(path, file_path_fixture)

        current_path = os.path.dirname(__file__)
        result_file_path = "test/tmp/th01.png"
        result_file_path = os.path.join(
            current_path, "..", "..", result_file_path)
        os.mkdir("test/tmp")

        path = "/pictures/previews/preview-files/%s.png" % self.preview.id
        self.download_file(path, result_file_path)
        result_image = Image.open(result_file_path)
        self.assertEqual(result_image.size, (1200, 674))

        path = "/pictures/thumbnails/preview-files/%s.png" % self.preview.id
        self.download_file(path, result_file_path)
        result_image = Image.open(result_file_path)
        self.assertEqual(result_image.size, (150, 100))

        path = \
            "/pictures/thumbnails-square/preview-files/%s.png" % self.preview.id
        self.download_file(path, result_file_path)
        result_image = Image.open(result_file_path)
        self.assertEqual(result_image.size, (100, 100))
