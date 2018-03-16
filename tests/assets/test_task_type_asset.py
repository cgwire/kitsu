from tests.base import ApiDBTestCase


class AssetTaskTypesTestCase(ApiDBTestCase):

    def setUp(self):
        super(AssetTaskTypesTestCase, self).setUp()
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
        self.generate_fixture_task()
        self.asset_id = self.asset.id
        self.task_type_dict = self.task_type.serialize()

    def test_get_task_types_for_asset(self):
        task_types = self.get("data/assets/%s/task-types" % self.asset_id)
        self.assertEquals(len(task_types), 1)
        self.assertDictEqual(
            task_types[0],
            self.task_type_dict
        )
