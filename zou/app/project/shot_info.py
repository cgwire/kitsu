from sqlalchemy.orm import aliased

from zou.app.models.project import Project
from zou.app.models.task import Task
from zou.app.models.task_status import TaskStatus
from zou.app.models.task_type import TaskType
from zou.app.models.entity import Entity
from zou.app.models.entity_type import EntityType
from zou.app.project.exception import (
    SequenceNotFoundException,
    ShotNotFoundException
)


def get_sequence_from_shot(shot):
    try:
        sequence = Entity.get(shot.parent_id)
    except:
        raise SequenceNotFoundException('Wrong parent_id for given shot.')
    return sequence


def get_episode_type():
    episode_type = EntityType.get_by(name="Episode")
    if episode_type is None:
        episode_type = EntityType.create(name="Episode")
    return episode_type


def get_sequence_type():
    sequence_type = EntityType.get_by(name="Sequence")
    if sequence_type is None:
        sequence_type = EntityType.create(name="Sequence")
    return sequence_type


def get_shot_type():
    shot_type = EntityType.get_by(name="Shot")
    if shot_type is None:
        shot_type = EntityType.create(name="Shot")
    return shot_type


def get_episodes(criterions={}):
    episode_type = get_episode_type()
    criterions["entity_type_id"] = episode_type.id

    return Entity.query.filter_by(**criterions).all()


def get_sequences(criterions={}):
    sequence_type = get_sequence_type()
    criterions["entity_type_id"] = sequence_type.id

    return Entity.query.filter_by(**criterions).all()


def get_shots(criterions={}):
    shot_type = get_shot_type()
    criterions["entity_type_id"] = shot_type.id
    Sequence = aliased(Entity, name='sequence')
    query = Entity.query.filter_by(**criterions)
    query = query.join(Project)
    query = query.join(Sequence, Sequence.id == Entity.parent_id)
    query = query.add_columns(Project.name)
    query = query.add_columns(Sequence.name)
    data = query.all()

    shots = []
    for (shot_model, project_name, sequence_name) in data:
        shot = shot_model.serialize()
        shot["project_name"] = project_name
        shot["sequence_name"] = sequence_name
        shots.append(shot)

    return shots


def get_shots_and_tasks(criterions={}):
    shots = get_shots(criterions)
    shot_ids = [shot["id"] for shot in shots]
    tasks = Task.query.filter(Entity.id.in_(shot_ids)).all()

    task_map = {}
    task_status_map = {
        status.id: status for status in TaskStatus.query.all()
    }
    task_type_map = {
        task_type.id: task_type for task_type in TaskType.query.all()
    }

    for task in tasks:
        shot_id = str(task.entity_id)
        if shot_id not in task_map:
            task_map[shot_id] = []
        task_dict = task.serialize()
        task_status = task_status_map[task.task_status_id]
        task_type = task_type_map[task.task_type_id]
        task_dict.update({
            "task_status_name": task_status.name,
            "task_status_short_name": task_status.short_name,
            "task_status_color": task_status.color,
            "task_type_name": task_type.name,
            "task_type_color": task_type.color
        })
        task_map[shot_id].append(task_dict)

    for shot in shots:
        shot["tasks"] = task_map.get(shot["id"], [])

    return shots


def get_shot(instance_id):
    shot_type = get_shot_type()
    shot = Entity.get_by(
        entity_type_id=shot_type.id,
        id=instance_id
    )
    if shot is None:
        raise ShotNotFoundException

    return shot


def is_shot(entity):
    shot_type = get_shot_type()
    return entity.entity_type_id == shot_type.id

def get_or_create_episode(project, name):
    episode_type = get_episode_type()
    episode = Entity.get_by(
        entity_type_id=episode_type.id,
        project_id=project.id,
        name=name
    )
    if episode is None:
        episode = Entity(
            entity_type_id=episode_type.id,
            project_id=project.id,
            name=name
        )
        episode.save()

    return episode


def get_or_create_sequence(project, episode, name):
    sequence_type = get_sequence_type()
    sequence = Entity.get_by(
        entity_type_id=sequence_type.id,
        parent_id=episode.id,
        project_id=project.id,
        name=name
    )
    if sequence is None:
        sequence = Entity(
            entity_type_id=sequence_type.id,
            parent_id=episode.id,
            project_id=project.id,
            name=name
        )
        sequence.save()

    return sequence


def get_episodes_for_project(project):
    episode_type = get_episode_type()
    return Entity.get_all_by(
        entity_type_id=episode_type.id,
        project_id=project.id
    )


def get_sequences_for_project(project):
    sequence_type = get_sequence_type()
    return Entity.get_all_by(
        entity_type_id=sequence_type.id,
        project_id=project.id
    )


def get_shots_for_project(project):
    shot_type = get_shot_type()
    return Entity.get_all_by(
        entity_type_id=shot_type.id,
        project_id=project.id
    )
