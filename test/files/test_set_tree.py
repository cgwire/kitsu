from test.base import ApiDBTestCase

from zou.app.models.project import Project
from zou.app.services import file_tree


class FolderPathTestCase(ApiDBTestCase):

    def setUp(self):
        super(FolderPathTestCase, self).setUp()
        self.generate_fixture_project_status()
        self.project_standard = Project(
            name='Iris',
            project_status_id=self.open_status.id
        )
        self.project_standard.save()

    def test_set_file_tree(self):
        tree = file_tree.get_tree_from_file('standard')
        path = "/actions/projects/%s/set-file-tree" % self.project_standard.id
        project = self.post(path, {"tree_name": "standard"}, 200)
        self.assertEquals(project["file_tree"], tree)
        project = self.get("data/projects/%s" % self.project_standard.id)
        self.assertEquals(project["file_tree"], tree)

    def test_set_file_tree_400(self):
        path = "/actions/projects/%s/set-file-tree" % self.project_standard.id
        self.post(path, {"name": "standard"}, 400)
        self.post(path, {"tree_name": "not_exist"}, 400)

    def test_set_file_tree_404(self):
        path = "/actions/projects/not-exist/set-file-tree"
        self.post(path, {"tree_name": "standard"}, 404)
