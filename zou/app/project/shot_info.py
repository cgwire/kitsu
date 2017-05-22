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

    return Entity.query.filter_by(**criterions).all()


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
