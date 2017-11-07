# -*- coding: UTF-8 -*-
import datetime

from test.base import ApiDBTestCase

from zou.app.models.task import Task
from zou.app.models.task_type import TaskType
from zou.app.models.time_spent import TimeSpent
from zou.app.services import tasks_service
from zou.app.utils import events, fields

from zou.app.services.exception import TaskNotFoundException


class ToReviewHandler(object):

    def __init__(self, open_status_id, to_review_status_id):
        self.is_event_fired = False
        self.open_status_id = open_status_id
        self.to_review_status_id = to_review_status_id

    def handle_event(self, data):
        self.is_event_fired = True
        self.data = data


class TaskServiceTestCase(ApiDBTestCase):

    def setUp(self):
        super(TaskServiceTestCase, self).setUp()

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
        self.generate_fixture_task_status_to_review()
        self.generate_fixture_person()
        self.generate_fixture_assigner()
        self.generate_fixture_task()
        self.generate_fixture_shot_task()
        self.generate_fixture_file_status()
        self.generate_fixture_software()
        self.generate_fixture_working_file()
        self.generate_fixture_output_type()
        self.generate_fixture_output_file()

        self.task_id = self.task.id
        self.open_status_id = self.task_status.id
        self.wip_status_id = self.task_status_wip.id
        self.to_review_status_id = self.task_status_to_review.id

        self.is_event_fired = False
        events.unregister_all()

    def handle_event(self, data):
        self.is_event_fired = True
        self.assertEqual(
            data["task_before"]["task_status_id"],
            str(self.open_status_id)
        )
        self.assertEqual(
            data["task_after"]["task_status_id"],
            str(self.wip_status_id)
        )

    def assert_event_is_fired(self):
        self.assertTrue(self.is_event_fired)

    def test_get_status(self):
        task_status = tasks_service.get_or_create_status("WIP", "wip")
        self.assertEqual(task_status.name, "WIP")

    def test_get_wip_status(self):
        task_status = tasks_service.get_wip_status()
        self.assertEqual(task_status.name, "WIP")

    def test_get_done_status(self):
        task_status = tasks_service.get_done_status()
        self.assertEqual(task_status.name, "Done")

    def test_get_todo_status(self):
        task_status = tasks_service.get_todo_status()
        self.assertEqual(task_status.name, "Todo")

    def test_get_to_review_status(self):
        task_status = tasks_service.get_to_review_status()
        self.assertEqual(task_status.name, "To review")

    def test_create_task(self):
        shot = self.shot.serialize()
        task_type = self.task_type.serialize()
        status = tasks_service.get_todo_status().serialize()
        task = tasks_service.create_task(task_type, shot)
        task = tasks_service.get_task(task["id"]).serialize()
        self.assertEquals(task["entity_id"], shot["id"])
        self.assertEquals(task["task_type_id"], task_type["id"])
        self.assertEquals(task["project_id"], shot["project_id"])
        self.assertEquals(task["task_status_id"], status["id"])

    def test_status_to_wip(self):
        events.register(
            "task:start",
            "mark_event_as_fired",
            self
        )

        now = datetime.datetime.now()
        self.task.update({"real_start_date": None})
        tasks_service.start_task(self.task)

        task = Task.get(self.task.id)
        self.assertEqual(task.task_status_id, self.wip_status_id)
        self.assertGreater(task.real_start_date.isoformat(), now.isoformat())
        self.assert_event_is_fired()

    def test_status_to_wip_twice(self):
        tasks_service.start_task(self.task)
        task = Task.get(self.task.id)
        real_start_date = task.real_start_date
        task.update({
            "task_status_id": self.task_status.id
        })

        tasks_service.start_task(self.task)
        task = Task.get(self.task.id)
        self.assertEqual(task.real_start_date, real_start_date)

    def test_publish_task(self):
        handler = ToReviewHandler(self.open_status_id, self.to_review_status_id)
        events.register(
            "task:to-review",
            "mark_event_as_fired",
            handler
        )
        tasks_service.task_to_review(self.task, self.person, "my comment")
        self.is_event_fired = handler.is_event_fired
        data = handler.data

        task = Task.get(self.task.id)
        self.assertEqual(task.task_status_id, self.to_review_status_id)
        self.assert_event_is_fired()

        self.assertEquals(
            data["task_before"]["task_status_id"],
            str(self.open_status_id)
        )

        self.assertEquals(
            data["task_after"]["task_status_id"],
            str(self.to_review_status_id)
        )

        self.assertEquals(
            data["task_after"]["project"]["id"],
            str(self.project.id)
        )

        self.assertEquals(
            data["task_after"]["entity"]["id"],
            str(self.entity.id)
        )

        self.assertEquals(
            data["task_after"]["entity_type"]["id"],
            str(self.entity_type.id)
        )

        self.assertEquals(
            data["task_after"]["person"]["id"],
            str(self.person.id)
        )

        self.assertEquals(data["task_after"]["comment"], "my comment")

    def test_assign_task(self):
        tasks_service.assign_task(self.task.id, self.assigner.id)
        self.assertEqual(self.task.assignees[1].id, self.assigner.id)

    def test_get_department_from_task_type(self):
        department = tasks_service.get_department_from_task_type(self.task_type)
        self.assertEqual(department.name, "Modeling")

    def test_get_task(self):
        self.assertRaises(
            TaskNotFoundException,
            tasks_service.get_task,
            "wrong-id"
        )
        task = tasks_service.get_task(self.task_id)
        self.assertEqual(self.task_id, task.id)
        self.output_file.delete()
        self.working_file.delete()
        task.delete()

        self.assertRaises(
            TaskNotFoundException,
            tasks_service.get_task,
            self.task_id
        )

    def test_remove_task(self):
        self.working_file.delete()
        self.output_file.delete()
        tasks_service.remove_task(self.task_id)
        self.assertRaises(
            TaskNotFoundException,
            tasks_service.get_task,
            self.task_id
        )

    def test_get_tasks_for_sequence(self):
        self.generate_fixture_sequence_task()
        tasks = tasks_service.get_tasks_for_sequence(self.sequence.id)
        self.assertEqual(len(tasks), 1)
        self.assertEqual(tasks[0]["id"], str(self.sequence_task.id))

    def test_get_tasks_for_shot(self):
        tasks = tasks_service.get_tasks_for_shot(self.shot.id)
        self.assertEqual(len(tasks), 1)
        self.assertEqual(tasks[0]["id"], str(self.shot_task.id))

    def test_get_tasks_for_asset(self):
        tasks = tasks_service.get_tasks_for_asset(self.entity.id)
        self.assertEqual(len(tasks), 1)
        self.assertEqual(tasks[0]["id"], str(self.task.id))

    def test_get_tasks_for_entity(self):
        tasks = tasks_service.get_task_dicts_for_entity(self.entity.id)
        self.assertEqual(len(tasks), 1)
        self.assertEqual(tasks[0]["id"], str(self.task.id))
        self.assertEqual(tasks[0]["task_type_name"], str("Shaders"))
        self.assertEqual(tasks[0]["entity_name"], str("Tree"))

    def test_get_task_types_for_shot(self):
        task_types = tasks_service.get_task_types_for_shot(self.shot.id)
        self.assertEqual(len(task_types), 1)
        self.assertEqual(task_types[0]["id"], str(self.task_type_animation.id))

    def test_get_task_types_for_sequence(self):
        self.generate_fixture_sequence_task()
        task_types = tasks_service.get_task_types_for_sequence(self.sequence.id)
        self.assertEqual(len(task_types), 1)
        self.assertEqual(task_types[0]["id"], str(self.task_type_animation.id))

    def test_get_task_types_for_entity(self):
        task_types = tasks_service.get_task_types_for_asset(self.entity.id)
        self.assertEqual(len(task_types), 1)
        self.assertEqual(task_types[0]["id"], str(self.task_type.id))

    def test_get_task_dicts_for_entity_utf8(self):
        start_date = fields.get_date_object("2017-02-20")
        due_date = fields.get_date_object("2017-02-28")
        real_start_date = fields.get_date_object("2017-02-22")
        self.working_file.delete()
        self.output_file.delete()
        self.task.delete()
        self.task_type = TaskType(
            name="Modélisation",
            color="#FFFFFF",
            department_id=self.department.id
        )
        self.task_type.save()
        self.task = Task(
            name="Première Tâche",
            project_id=self.project.id,
            task_type_id=self.task_type.id,
            task_status_id=self.task_status.id,
            entity_id=self.entity.id,
            assignees=[self.person],
            assigner_id=self.assigner.id,
            duration=50,
            estimation=40,
            start_date=start_date,
            due_date=due_date,
            real_start_date=real_start_date
        )
        self.task.save()

        tasks = tasks_service.get_task_dicts_for_entity(self.entity.id)
        self.assertEqual(len(tasks), 1)
        self.assertEqual(tasks[0]["name"], u"Première Tâche")
        self.assertEqual(tasks[0]["task_type_name"], u"Modélisation")

    def test_get_or_create_time_spents(self):
        person_id = self.person.id
        task_id = self.task.id

        duration = 3600
        time_spent = tasks_service.create_or_update_time_spent(
            person_id=person_id,
            task_id=task_id,
            date="2017-09-23",
            duration=duration
        )
        self.assertEquals(time_spent["duration"], duration)

        duration = 7200
        time_spent = tasks_service.create_or_update_time_spent(
            person_id=person_id,
            task_id=task_id,
            date="2017-09-23",
            duration=duration
        )
        self.assertEquals(time_spent["duration"], duration)

        duration = 7200
        time_spent = tasks_service.create_or_update_time_spent(
            person_id=person_id,
            task_id=task_id,
            date="2017-09-23",
            duration=duration,
            add=True
        )
        self.assertEquals(time_spent["duration"], 2 * duration)

    def test_get_time_spents(self):
        person_id = self.person.id
        user_id = self.user.id
        task_id = self.task.id
        TimeSpent.create(
            person_id=person_id,
            task_id=task_id,
            date=datetime.date(2017, 9, 23),
            duration=3600
        )
        TimeSpent.create(
            person_id=user_id,
            task_id=task_id,
            date=datetime.date(2017, 9, 23),
            duration=7200
        )
        time_spents = self.get(
            "/actions/tasks/%s/time-spents/2017-09-23/" % task_id
        )
        self.assertEquals(time_spents["total"], 10800)
        self.assertEquals(time_spents[str(user_id)]["duration"], 7200)
        self.assertEquals(time_spents[str(person_id)]["duration"], 3600)

    def test_clear_assignation(self):
        task_id = self.task.id
        tasks_service.assign_task(self.task.id, self.person.id)
        tasks_service.clear_assignation(task_id)
        task = Task.get(task_id)
        self.assertEquals(len(task.assignees), 0)
