from tests.source.shotgun.base import ShotgunTestCase


class ImportShotgunStepTestCase(ShotgunTestCase):

    def setUp(self):
        super(ImportShotgunStepTestCase, self).setUp()

    def test_import_steps(self):
        self.steps = self.load_fixture('steps')
        self.assertEqual(len(self.steps), 3)

        self.departments = self.get("data/departments")
        self.assertEqual(len(self.departments), 3)

    def test_import_wrong_step(self):
        data = [
            {"bad": "wrong"}
        ]
        self.step = self.post("/import/shotgun/steps", data, 200)
        self.assertEqual(len(self.step), 0)

    def test_import_step(self):
        sg_step_animation = {
            "code": "Animation",
            "color": "50,149,253",
            "id": 14,
            "type": "Step"
        }
        sg_step_modeling = {
            "code": "Modeling",
            "color": "50,149,253",
            "id": 15,
            "type": "Step"
        }
        sg_steps = [sg_step_animation, sg_step_modeling]

        api_path = "/import/shotgun/steps"
        task_types = self.post(api_path, sg_steps, 200)
        self.assertEqual(len(task_types), 2)

        departments = self.get("data/departments")
        self.assertEqual(len(departments), 2)
        task_types = self.get("data/task-types")
        self.assertEqual(len(task_types), 2)

        department = departments[0]
        self.assertEqual(department["name"], sg_step_animation["code"])
        self.assertEqual(department["color"], "#3295fd")

        task_type = task_types[0]
        self.assertEqual(task_type["name"], "Animation")
        self.assertEqual(task_type["color"], "#3295fd")
        self.assertEqual(task_type["shotgun_id"], sg_step_animation["id"])

    def test_import_step_with_space(self):
        sg_step = {
            "code": "Modeling Shaders",
            "color": "50,149,253",
            "id": 14,
            "type": "Step"
        }

        api_path = "/import/shotgun/steps"
        task_types = self.post(api_path, [sg_step], 200)
        self.assertEqual(len(task_types), 1)

        departments = self.get("data/departments")
        self.assertEqual(len(departments), 1)

        task_types = self.get("data/task-types")
        self.assertEqual(len(task_types), 1)

        department = departments[0]
        self.assertEqual(department["name"], "Modeling")
        self.assertEqual(department["color"], "#3295fd")

        task_type = task_types[0]
        self.assertEqual(task_type["name"], "Modeling Shaders")

    def test_import_step_twice(self):
        sg_step_animation = {
            "code": "Animation",
            "color": "50,149,253",
            "id": 14,
            "type": "Step"
        }
        sg_step_modeling = {
            "code": "Modeling",
            "color": "50,149,253",
            "id": 15,
            "type": "Step"
        }
        sg_steps = [sg_step_animation, sg_step_modeling]

        api_path = "/import/shotgun/steps"
        task_types = self.post(api_path, sg_steps, 200)
        self.assertEqual(len(task_types), 2)
        self.assertEqual(len(task_types), 2)
        task_types = self.post(api_path, sg_steps, 200)
        self.assertEqual(len(task_types), 2)
