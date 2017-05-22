import unittest
import os
import shutil

from PIL import Image

from werkzeug.datastructures import FileStorage

from zou.app import app
from zou.app.utils import thumbnail, fs


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

    def test_get_file_name(self):
        file_name = thumbnail.get_file_name("instance-id")
        self.assertEqual(file_name, "instance-id.png")

    def test_get_folder_name(self):
        folder_name = thumbnail.get_folder_name("shots")
        expected_result = os.path.join(app.config["THUMBNAIL_FOLDER"], "shots")
        self.assertEqual(folder_name, expected_result)

    def test_get_full_path(self):
        full_path = thumbnail.get_full_path("shots", "instance-id")
        expected_result = os.path.join(
            app.config["THUMBNAIL_FOLDER"],
            "shots",
            "instance-id.png"
        )
        self.assertEqual(full_path, expected_result)

    def test_create_type_folder(self):
        thumbnail.create_type_folder("shots")
        folder_name = thumbnail.get_folder_name("shots")
        self.assertTrue(os.path.exists(folder_name))

    def test_turn_into_thumbnail(self):
        file_path_fixture = self.get_fixture_file_path("thumbnails/th01.png")
        full_path = thumbnail.get_full_path("shots", "instance-id")
        thumbnail.create_type_folder("shots")
        shutil.copyfile(file_path_fixture, full_path)

        thumbnail.turn_into_thumbnail(full_path)
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

        thumbnail.turn_into_thumbnail(full_path)
        im = Image.open(full_path)
        (width, height) = im.size
        self.assertEqual(width, 150)
        self.assertEqual(height, 100)

    def test_url_path(self):
        url_path = thumbnail.url_path("shots", "instance-id")
        self.assertEqual(url_path, "thumbnails/shots/instance-id.png")
        url_path = thumbnail.url_path("working_files", "instance-id")
        self.assertEqual(url_path, "thumbnails/working-files/instance-id.png")
