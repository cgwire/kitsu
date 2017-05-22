import os
import datetime

from test.base import ApiDBTestCase

from zou.app.models.person import Person
from zou.app.models.task import Task
from zou.app.models.task_type import TaskType
from zou.app.models.task_status import TaskStatus


class ImportCsvTasksTestCase(ApiDBTestCase):

    def setUp(self):
        super(ImportCsvTasksTestCase, self).setUp()

        self.load_csv('persons')
        self.load_csv('projects')
        self.load_csv('shots')
        self.load_csv('assets')

        self.generate_fixture_project_status()
        self.generate_fixture_project()

    def load_csv(self, data_type):
        path = "/data/import/csv/%s" % data_type
        file_path_fixture = self.get_fixture_file_path(
            os.path.join("csv", "%s.csv" % data_type)
        )
        self.upload_file(path, file_path_fixture)

    def test_import_tasks(self):
        path = "/data/import/csv/tasks"
        file_path_fixture = self.get_fixture_file_path(
            os.path.join("csv", "tasks.csv")
        )
        self.upload_file(path, file_path_fixture)

        task_types = TaskType.query.all()
        self.assertEqual(len(task_types), 3)
        tasks = Task.query.all()
        self.assertEqual(len(tasks), 3)
        task_statuses = TaskStatus.query.all()
        self.assertEqual(len(task_statuses), 2)

        task = tasks[0]
        self.assertEqual(task.duration, 40 * 3600)
        self.assertEqual(
            task.start_date,
            datetime.datetime(2017, 3, 19, 0, 0, 0)
        )
        self.assertEqual(task.end_date, datetime.datetime(2017, 3, 19, 0, 0))
        person = Person.get_by(last_name="Doe")
        self.assertEqual(task.assignees, [person])
