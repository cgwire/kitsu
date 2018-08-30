import unittest
import os


from zou.app import app
from zou.app.stores import file_store
from zou.app.utils import fs


class FileStoreTestCase(unittest.TestCase):

    def setUp(self):
        super(FileStoreTestCase, self).setUp()
        with app.app_context():
            self.store = file_store
            self.store.clear()

    def tearDown(self):
        self.store.clear()

    def get_fixture_file_path(self, relative_path):
        current_path = os.getcwd()
        file_path_fixture = os.path.join(
            current_path,
            "tests",
            "fixtures",
            relative_path
        )
        return file_path_fixture

    def test_path(self):
        file_name = "thumbnails-63e453f1-9655-49ad-acba-ff7f27c49e9d"
        self.assertEquals(
            file_store.path(file_store.pictures, file_name),
            "./tmp/pictures/thumbnails/63e/453/"
            "63e453f1-9655-49ad-acba-ff7f27c49e9d"
        )

    def test_add_and_open_picture(self):
        file_path_fixture = self.get_fixture_file_path("thumbnails/th01.png")
        file_store.add_picture(
            "thumbnails",
            "63e453f1-9655-49ad-acba-ff7f27c49e9d",
            file_path_fixture
        )
        file_name = "thumbnails-63e453f1-9655-49ad-acba-ff7f27c49e9d"
        result_path = file_store.path(file_store.pictures, file_name)
        self.assertTrue(os.path.exists(result_path))
