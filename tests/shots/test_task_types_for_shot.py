from tests.base import ApiDBTestCase


class ShotTaskTypesTestCase(ApiDBTestCase):

    def setUp(self):
        super(ShotTaskTypesTestCase, self).setUp()
        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_asset_type()
        self.generate_fixture_sequence()
        self.generate_fixture_shot()
        self.generate_fixture_asset()
        self.generate_fixture_person()
        self.generate_fixture_assigner()
        self.generate_fixture_task_status()
        self.generate_fixture_department()
        self.generate_fixture_task_type()
        self.generate_fixture_shot_task()

    def test_get_task_types_for_shot(self):
        task_types = self.get("/data/shots/%s/task-types" % self.shot.id)
        self.assertEquals(len(task_types), 1)
        self.assertDictEqual(
            task_types[0],
            self.task_type_animation.serialize()
        )
