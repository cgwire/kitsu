from tests.base import ApiDBTestCase

from zou.app.services import projects_service


class PermissionTestCase(ApiDBTestCase):

    def setUp(self):
        super(PermissionTestCase, self).setUp()

        self.generate_fixture_user_cg_artist()
        self.user_cg_artist_id = self.user_cg_artist["id"]
        self.generate_fixture_user_manager()
        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.project_id = self.project.id

    def tearDown(self):
        self.log_out()

    def test_admin_can_create_project(self):
        self.log_in(self.user["email"])
        data = {
            "name": "Cosmos Landromat 2"
        }
        self.post("data/projects/", data, 201)

    def test_admin_can_edit_project(self):
        self.log_in(self.user["email"])

    def test_admin_can_read_project(self):
        self.log_in(self.user["email"])

    def test_cg_artist_cannot_create_project(self):
        self.log_in_cg_artist()
        data = {
            "name": "Cosmos Landromat 2"
        }
        self.post("data/projects/", data, 403)

    def test_cg_artist_cannot_edit_project(self):
        self.log_in_cg_artist()
        data = {
            "name": "Cosmos Landromat 2 edited"
        }
        self.put("data/projects/%s" % self.project_id, data, 403)

    def test_cg_artist_can_read_open_projects(self):
        self.log_in_cg_artist()
        self.get("data/projects/open")

    def test_manager_cannot_create_person(self):
        self.log_in_manager()
        data = {
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@gmail.com"
        }
        self.post("data/persons/new", data, 403)

    def test_admin_can_create_person(self):
        self.log_in_admin()
        data = {
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@gmail.com"
        }
        self.post("data/persons/new", data, 201)

    def test_manager_cannot_update_admin(self):
        self.log_in_manager()
        data = {
            "email": "john.doe2@gmail.com"
        }
        self.put("data/persons/%s" % self.user["id"], data, 403)

    def test_manager_cannot_update_person(self):
        self.log_in_manager()
        data = {
            "role": "admin"
        }
        self.put("data/persons/%s" % self.user_cg_artist_id, data, 403)
        self.get("data/persons/%s" % self.user_cg_artist_id)

    def test_admin_can_update_admin(self):
        self.log_in_admin()
        data = {
            "first_name": "Super admin"
        }
        self.put("data/persons/%s" % self.user["id"], data, 200)

    def test_manager_cannot_delete_admin(self):
        self.log_in_manager()
        self.delete("data/persons/%s" % self.user["id"], 403)

    def test_user_projects(self):
        self.generate_fixture_project_standard()
        self.generate_fixture_project_closed_status()
        self.generate_fixture_project_closed()
        self.generate_fixture_asset_type()
        self.generate_fixture_asset()
        self.log_in_cg_artist()
        user_id = str(self.user_cg_artist["id"])
        projects = self.get("data/projects")
        self.assertEquals(len(projects), 0)

        projects_service.add_team_member(self.project_id, user_id)
        projects = self.get("data/projects")
        self.assertEquals(len(projects), 1)
        projects = self.get("data/projects/all")
        self.assertEquals(len(projects), 1)
        projects = self.get("data/projects/open")
        self.assertEquals(len(projects), 1)

    def test_is_in_team(self):
        self.generate_fixture_asset_type()
        self.generate_fixture_asset()
        asset_id = self.asset.id
        self.log_in_cg_artist()
        self.get("data/assets/%s" % asset_id, 403)
        projects_service.add_team_member(
            self.project_id,
            self.user_cg_artist["id"]
        )
        self.get("data/assets/%s" % asset_id, 200)
