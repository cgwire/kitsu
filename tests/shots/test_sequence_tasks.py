from tests.base import ApiDBTestCase


class SequenceTasksTestCase(ApiDBTestCase):

    def setUp(self):
        super(SequenceTasksTestCase, self).setUp()
        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_asset_type()
        self.generate_fixture_episode()
        self.generate_fixture_sequence()
        self.generate_fixture_asset()
        self.generate_fixture_person()
        self.generate_fixture_assigner()
        self.generate_fixture_task_status()
        self.generate_fixture_department()
        self.generate_fixture_task_type()
        self.generate_fixture_sequence_task()
        self.person_id = str(self.person.id)

    def test_get_tasks_for_sequence(self):
        tasks = self.get("data/sequences/%s/tasks" % self.sequence.id)
        self.assertEquals(len(tasks), 1)
        self.assertEqual(tasks[0]["id"], str(self.sequence_task.id))

    def test_get_sequences_and_tasks(self):
        self.generate_fixture_sequence_task(name="Secondary")
        sequences = self.get("data/sequences/with-tasks")
        self.assertEqual(len(sequences), 1)
        self.assertEqual(len(sequences[0]["tasks"]), 2)
        self.assertEqual(sequences[0]["tasks"][0]["assignees"][0], self.person_id)
        self.assertEqual(sequences[0]["name"], "S01")

    def test_get_task_types_for_sequence(self):
        task_types = self.get("/data/sequences/%s/task-types" % self.sequence.id)
        self.assertEquals(len(task_types), 1)
        self.assertDictEqual(
            task_types[0],
            self.task_type_animation.serialize()
        )
