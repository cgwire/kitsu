import unittest
import os

from PIL import Image

from werkzeug.datastructures import FileStorage

from zou.app import app, config
from zou.app.utils import thumbnail, fs

TEST_FOLDER = os.path.join("test", "tmp")


class ThumbnailTestCase(unittest.TestCase):

    def get_fixture_file_path(self, relative_path):
        current_path = os.getcwd()
        file_path_fixture = os.path.join(
            current_path,
            "test",
            "fixtures",
            relative_path
        )
        return file_path_fixture

    def setUp(self):
        super(ThumbnailTestCase, self).setUp()
        folder_name = thumbnail.get_folder_name("shots")
        fs.rm_rf(folder_name)

    def tearDown(self):
        super(ThumbnailTestCase, self).tearDown()
        folder_name = thumbnail.get_folder_name("shots")
        fs.rm_rf(folder_name)
        fs.rm_rf(TEST_FOLDER)
        fs.rm_rf(config.THUMBNAIL_FOLDER)

    def test_get_file_name(self):
        file_name = thumbnail.get_file_name("instance-id")
        self.assertEqual(file_name, "instance-id.png")

    def test_get_folder_name(self):
        folder_name = thumbnail.get_folder_name("shots")
        expected_result = os.path.join(app.config["THUMBNAIL_FOLDER"], "shots")
        self.assertEqual(folder_name, expected_result)

    def test_get_preview_folder_name(self):
        path = thumbnail.get_preview_folder_name("originals", "123413-12312")
        self.assertEquals(
            path,
            os.path.join(config.THUMBNAIL_FOLDER, "preview-files/originals/123")
        )

    def test_get_file_path(self):
        full_path = thumbnail.get_file_path("shots", "instance-id")
        expected_result = os.path.join(
            app.config["THUMBNAIL_FOLDER"],
            "shots",
            "instance-id.png"
        )
        self.assertEqual(full_path, expected_result)

    def test_create_folder(self):
        thumbnail.create_folder("shots")
        folder_name = thumbnail.get_folder_name("shots")
        self.assertTrue(os.path.exists(folder_name))

    def test_turn_into_thumbnail(self):
        file_path_fixture = self.get_fixture_file_path("thumbnails/th01.png")
        full_path = thumbnail.get_file_path("shots", "instance-id")
        thumbnail.create_folder("shots")
        fs.copyfile(file_path_fixture, full_path)

        thumbnail.turn_into_thumbnail(full_path)
        im = Image.open(full_path)
        (width, height) = im.size
        self.assertEqual(width, 180)
        self.assertEqual(height, 101)

        thumbnail.turn_into_thumbnail(full_path, thumbnail.RECTANGLE_SIZE)
        im = Image.open(full_path)
        (width, height) = im.size
        self.assertEqual(width, 150)
        self.assertEqual(height, 100)

    def test_save_file(self):
        file_path_fixture = self.get_fixture_file_path("thumbnails/th01.png")
        th_file = FileStorage(
            stream=open(file_path_fixture, "rb"),
            filename="th01.png"
        )
        full_path = thumbnail.save_file("shots", "instance-id", th_file)

        thumbnail.turn_into_thumbnail(full_path, thumbnail.RECTANGLE_SIZE)
        im = Image.open(full_path)
        (width, height) = im.size
        self.assertEqual(width, 150)
        self.assertEqual(height, 100)

    def test_url_path(self):
        url_path = thumbnail.url_path("shots", "instance-id")
        self.assertEqual(
            url_path,
            "pictures/thumbnails/shots/instance-id.png"
        )
        url_path = thumbnail.url_path("working_files", "instance-id")
        self.assertEqual(
            url_path,
            "pictures/thumbnails/working-files/instance-id.png"
        )

    def test_flat(self):
        flatten_tupple = thumbnail.flat(1.2, 3.1, 4.2)
        self.assertEquals(flatten_tupple, (1, 3, 4))

    def test_get_image_size(self):
        file_path_fixture = self.get_fixture_file_path("thumbnails/th01.png")
        size = thumbnail.get_image_size(file_path_fixture)
        self.assertEquals(size, (180, 101))

    def test_get_full_size_from_width(self):
        file_path_fixture = self.get_fixture_file_path("thumbnails/th01.png")
        im = Image.open(file_path_fixture)
        size = thumbnail.get_full_size_from_width(im, 1200)
        self.assertEquals(size, (1200, 674))

    def test_prepare_image_for_thumbnail(self):
        file_path_fixture = self.get_fixture_file_path("thumbnails/th01.png")
        im = Image.open(file_path_fixture)
        im = thumbnail.prepare_image_for_thumbnail(im, thumbnail.SQUARE_SIZE)
        self.assertEquals(im.size, (101, 101))

    def test_generate_preview_variants(self):
        preview_id = "123413-12312"
        file_path_fixture = self.get_fixture_file_path("thumbnails/th01.png")
        file_name = thumbnail.get_file_name(preview_id)
        folder_path = thumbnail.get_preview_folder_name("originals", preview_id)
        fs.mkdir_p(folder_path)
        fs.copyfile(file_path_fixture, os.path.join(folder_path, file_name))
        thumbnail.generate_preview_variants(preview_id)

        file_path = thumbnail.get_preview_file_path(
            "previews", preview_id)
        self.assertTrue(os.path.exists(file_path))
        self.assertTrue(Image.open(file_path).size, thumbnail.PREVIEW_SIZE)

        folder_path = thumbnail.get_preview_folder_name(
            "thumbnails", preview_id)
        self.assertTrue(os.path.exists(file_path))
        self.assertTrue(Image.open(file_path).size, thumbnail.RECTANGLE_SIZE)

        folder_path = thumbnail.get_preview_folder_name(
            "thumbnails-square", preview_id)
        self.assertTrue(os.path.exists(file_path))
        self.assertTrue(Image.open(file_path).size, thumbnail.SQUARE_SIZE)

    def test_get_preview_url_path(self):
        preview_id = '123345-12234-121234'
        path = thumbnail.get_preview_url_path(preview_id)
        self.assertEquals(
            path,
            {
                "original": "/api/pictures/originals/preview-files/%s.png" %
                preview_id,
                "previews": "/api/pictures/previews/preview-files/%s.png" %
                preview_id,
                "thumbnail": "/api/pictures/thumbnails/preview-files/%s.png" %
                preview_id,
                "thumbnail_square": "/api/pictures/thumbnails-square/preview-files/%s.png" %
                preview_id,
            }
        )
