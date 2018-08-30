import unittest
import os

from PIL import Image

from werkzeug.datastructures import FileStorage

from zou.app import app
from zou.app.utils import thumbnail, fs

TEST_FOLDER = os.path.join("tests", "tmp")


class ThumbnailTestCase(unittest.TestCase):

    def get_fixture_file_path(self, relative_path):
        current_path = os.getcwd()
        file_path_fixture = os.path.join(
            current_path,
            "tests",
            "fixtures",
            relative_path
        )
        return file_path_fixture

    def setUp(self):
        super(ThumbnailTestCase, self).setUp()
        fs.mkdir_p(TEST_FOLDER)
        self.folder_name = os.path.join(TEST_FOLDER, "persons")

    def tearDown(self):
        super(ThumbnailTestCase, self).tearDown()
        fs.rm_rf(self.folder_name)
        fs.rm_rf(TEST_FOLDER)
        fs.rm_rf(app.config["PREVIEW_FOLDER"])

    def test_turn_into_thumbnail(self):
        file_path_fixture = self.get_fixture_file_path("thumbnails/th01.png")
        full_path =  os.path.join(
            TEST_FOLDER,
            thumbnail.get_file_name("instance-id")
        )
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

    def test_convert_jpg_to_png(self):
        file_path_fixture = self.get_fixture_file_path("thumbnails/th04.jpg")
        file_name = "th04.jpg"
        file_path = os.path.join(TEST_FOLDER, file_name)
        fs.copyfile(file_path_fixture, file_path)
        im = Image.open(file_path)

        thumbnail.convert_jpg_to_png(file_path)
        result_path = os.path.join(TEST_FOLDER, "th04.png")
        im = Image.open(result_path)
        self.assertEquals(len(im.info.keys()), 0)
        self.assertTrue(os.path.exists(result_path))

    def test_save_file(self):
        file_path_fixture = self.get_fixture_file_path("thumbnails/th01.png")
        th_file = FileStorage(
            stream=open(file_path_fixture, "rb"),
            filename="th01.png"
        )
        full_path = thumbnail.save_file(TEST_FOLDER, "instance-id", th_file)

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

        file_path_fixture = self.get_fixture_file_path("thumbnails/th02.png")
        im = Image.open(file_path_fixture)
        im = thumbnail.prepare_image_for_thumbnail(im, thumbnail.RECTANGLE_SIZE)
        self.assertEquals(im.size, (152, 101))

        file_path_fixture = self.get_fixture_file_path("thumbnails/th03.png")
        im = Image.open(file_path_fixture)
        im = thumbnail.prepare_image_for_thumbnail(im, thumbnail.RECTANGLE_SIZE)
        self.assertEquals(im.size, (180, 120))

    def test_generate_preview_variants(self):
        preview_id = "123413-12312"
        file_path_fixture = self.get_fixture_file_path("thumbnails/th01.png")
        file_name = thumbnail.get_file_name(preview_id)
        original_path = os.path.join(TEST_FOLDER, file_name)
        fs.copyfile(file_path_fixture, original_path)
        thumbnail.generate_preview_variants(original_path, preview_id)

        file_path = os.path.join(TEST_FOLDER, "previews-%s.png" % preview_id)
        self.assertTrue(os.path.exists(file_path))
        self.assertTrue(Image.open(file_path).size, thumbnail.PREVIEW_SIZE)

        file_path = os.path.join(TEST_FOLDER, "thumbnails-%s.png" % preview_id)
        self.assertTrue(os.path.exists(file_path))
        self.assertTrue(Image.open(file_path).size, thumbnail.RECTANGLE_SIZE)

        file_path = os.path.join(
            TEST_FOLDER,
            "thumbnails-square-%s.png" % preview_id
        )
        self.assertTrue(os.path.exists(file_path))
        self.assertTrue(Image.open(file_path).size, thumbnail.SQUARE_SIZE)
