import os

from test.base import ApiDBTestCase

from zou.app.utils import fs

from PIL import Image


class RouteTaskChangeTestCase(ApiDBTestCase):

    def setUp(self):
        super(RouteTaskChangeTestCase, self).setUp()

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
        self.generate_fixture_working_file()

    def tearDown(self):
        super(RouteTaskChangeTestCase, self).tearDown()

        self.delete_thumbnail_folders()

    def delete_thumbnail_folders(self):
        fs.rm_rf("test/tmp")
        fs.rm_rf("thumbnails")

    def test_add_thumbnail(self):
        path = "/thumbnails/shots/%s" % self.shot.id

        file_path_fixture = self.get_fixture_file_path(
                os.path.join("thumbnails", "th01.png"))
        self.upload_file(path, file_path_fixture)

        path = "/thumbnails/shots/%s.png" % self.shot.id
        current_path = os.path.dirname(__file__)
        result_file_path = "test/tmp/th01.png"
        result_file_path = os.path.join(
            current_path, "..", "..", result_file_path)

        os.mkdir("test/tmp")
        self.download_file(path, result_file_path)

        file_path_expected = self.get_fixture_file_path(
                os.path.join("..", "tmp", "th01_expected.png"))
        im = Image.open(file_path_fixture)
        im = im.resize((150, 100))
        im.save(file_path_expected)

        file_path_fixture_content = open(file_path_expected, "rb").read()
        file_path_content = open(result_file_path, "rb").read()
        self.assertEqual(file_path_fixture_content, file_path_content)

    def test_add_thumbnail_working_file(self):
        path = "/thumbnails/working-files/%s" % self.working_file.id

        file_path_fixture = self.get_fixture_file_path(
                os.path.join("thumbnails", "th01.png"))
        self.upload_file(path, file_path_fixture)

        path = "/thumbnails/working-files/%s.png" % self.working_file.id
        current_path = os.path.dirname(__file__)
        result_file_path = "test/tmp/th01.png"
        result_file_path = os.path.join(
            current_path, "..", "..", result_file_path)

        os.mkdir("test/tmp")
        self.download_file(path, result_file_path)

        file_path_expected = self.get_fixture_file_path(
                os.path.join("..", "tmp", "th01_expected.png"))
        im = Image.open(file_path_fixture)
        im = im.resize((150, 100))
        im.save(file_path_expected)

        file_path_fixture_content = open(file_path_expected, "rb").read()
        file_path_content = open(result_file_path, "rb").read()
        self.assertEqual(file_path_fixture_content, file_path_content)
