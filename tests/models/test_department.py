from tests.base import ApiDBTestCase

from zou.app.models.department import Department

from zou.app.utils import fields


class DepartmentTestCase(ApiDBTestCase):

    def setUp(self):
        super(DepartmentTestCase, self).setUp()
        self.generate_data(Department, 3)

    def test_get_departments(self):
        departments = self.get("data/departments")
        self.assertEquals(len(departments), 3)

    def test_get_department(self):
        department = self.get_first("data/departments")
        department_again = self.get("data/departments/%s" % department["id"])
        self.assertEquals(department, department_again)
        self.get_404("data/departments/%s" % fields.gen_uuid())

    def test_create_department(self):
        data = {
            "name": "open",
            "color": "#000000"
        }
        self.department = self.post("data/departments", data)
        self.assertIsNotNone(self.department["id"])

        departments = self.get("data/departments")
        self.assertEquals(len(departments), 4)

    def test_update_department(self):
        department = self.get_first("data/departments")
        data = {
            "color": "#FFFFFF"
        }
        self.put("data/departments/%s" % department["id"], data)
        department_again = self.get(
            "data/departments/%s" % department["id"])
        self.assertEquals(data["color"], department_again["color"])
        self.put_404("data/departments/%s" % fields.gen_uuid(), data)

    def test_delete_department(self):
        departments = self.get("data/departments")
        self.assertEquals(len(departments), 3)
        department = departments[0]
        self.delete("data/departments/%s" % department["id"])
        departments = self.get("data/departments")
        self.assertEquals(len(departments), 2)
        self.delete_404("data/departments/%s" % fields.gen_uuid())
