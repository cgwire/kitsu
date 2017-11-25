import datetime

from zou.app.models.project import Project
from zou.app.models.entity import Entity
from zou.app.models.entity_type import EntityType
from zou.app.models.person import Person
from zou.app.models.task import Task
from zou.app.services import shots_service, tasks_service

from zou.app.blueprints.source.csv.base import BaseCsvImportResource


class TasksCsvImportResource(BaseCsvImportResource):

    def prepare_import(self):
        self.projects = {}
        self.sequences = {}
        self.episodes = {}
        self.shots = {}
        self.entity_types = {}
        self.entities = {}
        self.persons = {}
        self.departments = {}
        self.task_types = {}
        self.task_statuses = {}

        for project in Project.query.all():
            self.projects[project.name] = project

        for person in Person.query.all():
            self.persons[person.first_name + " " + person.last_name] = person

        for episode in shots_service.get_episodes():
            self.episodes[
                str(episode["project_id"]) + episode["name"]
            ] = episode

        for sequence in shots_service.get_sequences():
            self.sequences["%s%s%s" % (
                sequence["project_id"],
                sequence["parent_id"],
                sequence["name"]
            )] = sequence

        for shot in shots_service.get_shots():
            self.shots["%s%s%s" % (
                shot["project_id"],
                shot["parent_id"],
                shot["name"]
            )] = shot

        for entity_type in EntityType.query.all():
            self.entity_types[entity_type.name] = entity_type

        for entity in Entity.query.all():
            self.entities["%s%s%s" % (
                entity.project_id,
                entity.entity_type_id,
                entity.name
            )] = entity

    def normalize_date(self, date):
        result = None
        if len(date) > 0:
            result = datetime.datetime.strptime(date, "%Y-%m-%d")
        return result

    def import_row(self, row):
        project_name = row["Project"]
        department_name = row["Department"]
        task_type_name = row["Task Type"]
        task_status_name = row["Task Status"]
        entity_type_name = row["Asset Type"]
        entity_name = row["Asset"]
        episode_name = row["Episode"]
        sequence_name = row["Sequence"]
        shot_name = row["Shot"]
        name = row["Name"]
        assigner_name = row["Assigner"]
        assignee_name = row["Assignee"]
        duration = int(row["Duration"]) * 3600
        estimation = int(row["Estimation"]) * 3600
        start_date = self.normalize_date(row["Start Date"])
        real_start_date = self.normalize_date(row["Real Start Date"])
        due_date = self.normalize_date(row["Due Date"])
        end_date = self.normalize_date(row["End Date"])

        self.add_to_cache_if_absent(
            self.task_statuses,
            tasks_service.get_or_create_status,
            task_status_name
        )
        task_status_id = self.get_id_from_cache(
            self.task_statuses,
            task_status_name
        )

        self.add_to_cache_if_absent(
            self.departments,
            tasks_service.get_or_create_department,
            department_name
        )
        department_id = self.get_id_from_cache(
            self.departments,
            department_name
        )

        task_type_key = "%s-%s" % (department_id, task_type_name)
        if task_type_key not in self.task_types:
            department = self.departments[department_name]
            self.task_types[task_type_key] = \
                tasks_service.get_or_create_task_type(
                    department,
                    task_type_name
                )

        task_type_id = self.get_id_from_cache(
            self.task_types,
            task_type_key
        )
        project_id = self.projects[project_name].id
        assigner_id = self.persons[assigner_name].id
        assignee = self.persons.get(assignee_name, None)

        if len(shot_name) > 0:
            episode_id = self.episodes[str(project_id) + episode_name]["id"]
            sequence_id = self.sequences[
                str(project_id) + str(episode_id) + sequence_name
            ]["id"]
            entity_id = self.shots[
                str(project_id) + str(sequence_id) + shot_name
            ]["id"]
        else:
            entity_type_id = self.entity_types[entity_type_name].id
            entity_id = self.entities[
                str(project_id) + str(entity_type_id) + entity_name
            ].id

        task = Task.create(
            name=name,
            project_id=project_id,
            task_type_id=task_type_id,
            entity_id=entity_id,
            task_status_id=task_status_id,
            assigner_id=assigner_id,
            duration=duration,
            estimation=estimation,
            start_date=start_date,
            end_date=end_date,
            real_start_date=real_start_date,
            due_date=due_date
        )
        if assignee is not None:
            task.assignees.append(assignee)
        task.save()

        return task
