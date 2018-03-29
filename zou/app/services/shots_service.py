from sqlalchemy.orm import aliased
from sqlalchemy.exc import IntegrityError, StatementError

from zou.app.utils import events, fields, cache

from zou.app.models.entity import Entity
from zou.app.models.project import Project
from zou.app.models.task import Task
from zou.app.models.task import association_table as assignees_table

from zou.app.services import projects_service, entities_service
from zou.app.services.exception import (
    EpisodeNotFoundException,
    SequenceNotFoundException,
    SceneNotFoundException,
    ShotNotFoundException
)


def get_sequence_from_shot(shot):
    try:
        sequence = Entity.get(shot["parent_id"])
    except:
        raise SequenceNotFoundException('Wrong parent_id for given shot.')
    return sequence.serialize(obj_type="Sequence")


def get_episode_from_sequence(sequence):
    try:
        episode = Entity.get(sequence["parent_id"])
    except:
        raise EpisodeNotFoundException('Wrong parent_id for given sequence.')
    return episode.serialize(obj_type="Episode")


@cache.memoize_function(120)
def get_episode_type():
    return entities_service.get_entity_type("Episode")


@cache.memoize_function(120)
def get_sequence_type():
    return entities_service.get_entity_type("Sequence")


@cache.memoize_function(120)
def get_shot_type():
    return entities_service.get_entity_type("Shot")


@cache.memoize_function(120)
def get_scene_type():
    return entities_service.get_entity_type("Scene")


@cache.memoize_function(120)
def get_camera_type():
    return entities_service.get_entity_type("Camera")


def get_episodes(criterions={}):
    episode_type = get_episode_type()
    criterions["entity_type_id"] = episode_type["id"]
    result = Entity.query.filter_by(**criterions).order_by("name").all()
    return Entity.serialize_list(result, obj_type="Episode")


def get_sequences(criterions={}):
    sequence_type = get_sequence_type()
    criterions["entity_type_id"] = sequence_type["id"]
    result = Entity.query.filter_by(**criterions).order_by(Entity.name).all()
    return Entity.serialize_list(result, obj_type="Sequence")


def get_shots(criterions={}):
    shot_type = get_shot_type()
    criterions["entity_type_id"] = shot_type["id"]
    Sequence = aliased(Entity, name='sequence')
    query = Entity.query.filter_by(**criterions)
    query = query.join(Project)
    query = query.join(Sequence, Sequence.id == Entity.parent_id)
    query = query.add_columns(Project.name)
    query = query.add_columns(Sequence.name)
    query = query.order_by(Entity.name)
    data = query.all()

    shots = []
    for (shot_model, project_name, sequence_name) in data:
        shot = shot_model.serialize(obj_type="Shot")
        shot["project_name"] = project_name
        shot["sequence_name"] = sequence_name
        shots.append(shot)

    return shots


def get_scenes(criterions={}):
    scene_type = get_scene_type()
    criterions["entity_type_id"] = scene_type["id"]
    Sequence = aliased(Entity, name='sequence')
    query = Entity.query.filter_by(**criterions)
    query = query.join(Project)
    query = query.join(Sequence, Sequence.id == Entity.parent_id)
    query = query.add_columns(Project.name)
    query = query.add_columns(Sequence.name)
    data = query.all()

    scenes = []
    for (scene_model, project_name, sequence_name) in data:
        scene = scene_model.serialize(obj_type="Scene")
        scene["project_name"] = project_name
        scene["sequence_name"] = sequence_name
        scenes.append(scene)

    return scenes


def get_episode_map(criterions={}):
    episodes = get_episodes(criterions)
    episode_map = {}
    for episode in episodes:
        episode_map[episode["id"]] = episode
    return episode_map


def get_shots_and_tasks(criterions={}):
    shot_type = get_shot_type()
    shot_map = {}
    task_map = {}

    Sequence = aliased(Entity, name='sequence')
    Episode = aliased(Entity, name='episode')

    query = Entity.query \
        .join(Sequence, Sequence.id == Entity.parent_id) \
        .outerjoin(Episode, Episode.id == Sequence.parent_id) \
        .outerjoin(Task, Task.entity_id == Entity.id) \
        .outerjoin(assignees_table) \
        .add_columns(
            Episode.name,
            Episode.id,
            Sequence.name,
            Sequence.id,
            Task.id,
            Task.task_type_id,
            Task.task_status_id,
            assignees_table.columns.person
        ) \
        .filter(Entity.entity_type_id == shot_type["id"]) \

    if "project_id" in criterions:
        query = query.filter(Entity.project_id == criterions["project_id"]) \

    for (
        shot,
        episode_name,
        episode_id,
        sequence_name,
        sequence_id,
        task_id,
        task_type_id,
        task_status_id,
        person_id
    ) in query.all():
        shot_id = str(shot.id)

        shot.data = shot.data or {}

        if shot_id not in shot_map:
            shot_map[shot_id] = {
                "id": str(shot.id),
                "name": shot.name,
                "description": shot.description,
                "frame_in": shot.data.get("frame_in", None),
                "frame_out": shot.data.get("frame_out", None),
                "fps": shot.data.get("fps", None),
                "preview_file_id": str(shot.preview_file_id or ""),
                "episode_id": str(episode_id),
                "episode_name": episode_name,
                "sequence_id": str(sequence_id),
                "sequence_name": sequence_name,
                "canceled": shot.canceled,
                "data": fields.serialize_value(shot.data),
                "tasks": []
            }

        if task_id is not None:

            if task_id not in task_map:
                task_dict = {
                    "id": str(task_id),
                    "entity_id": shot_id,
                    "task_status_id": str(task_status_id),
                    "task_type_id": str(task_type_id),
                    "assignees": []
                }
                task_map[task_id] = task_dict
                shot_dict = shot_map[shot_id]
                shot_dict["tasks"].append(task_dict)

            if person_id:
                task_map[task_id]["assignees"].append(str(person_id))

    return list(shot_map.values())


def get_shot_raw(shot_id):
    shot_type = get_shot_type()
    try:
        shot = Entity.get_by(
            entity_type_id=shot_type["id"],
            id=shot_id
        )
    except StatementError:
        raise SequenceNotFoundException

    if shot is None:
        raise ShotNotFoundException

    return shot


def get_shot(shot_id):
    return get_shot_raw(shot_id).serialize(obj_type="Shot")


def get_full_shot(shot_id):
    shot = get_shot(shot_id)
    sequence = Entity.get(shot["parent_id"])
    project = Project.get(shot["project_id"])
    shot["project_name"] = project.name
    shot["sequence_id"] = str(sequence.id)
    shot["sequence_name"] = sequence.name

    if sequence.parent_id is not None:
        episode = Entity.get(sequence.parent_id)
        shot["episode_id"] = str(episode.id)
        shot["episode_name"] = episode.name

    tasks = Task.query \
        .filter_by(entity_id=shot_id) \
        .all()
    task_dicts = []
    for task in tasks:
        task_dicts.append({
            "id": str(task.id),
            "task_status_id": str(task.task_status_id),
            "task_type_id": str(task.task_type_id),
            "assignees": [str(assignee.id) for assignee in task.assignees]
        })
    shot["tasks"] = task_dicts
    return shot


def get_scene_raw(scene_id):
    scene_type = get_scene_type()
    try:
        scene = Entity.get_by(
            entity_type_id=scene_type["id"],
            id=scene_id
        )
    except StatementError:
        raise SequenceNotFoundException

    if scene is None:
        raise SceneNotFoundException

    return scene


def get_scene(scene_id):
    return get_scene_raw(scene_id).serialize(obj_type="Scene")


def get_full_scene(scene_id):
    scene = get_scene(scene_id)
    project = Project.get(scene["project_id"])
    sequence = Entity.get(scene["parent_id"])
    scene["project_name"] = project.name
    scene["sequence_id"] = str(sequence.id)
    scene["sequence_name"] = sequence.name

    if sequence.parent_id is not None:
        episode = Entity.get(sequence.parent_id)
        scene["episode_id"] = str(episode.id)
        scene["episode_name"] = episode.name

    return scene


def get_sequence_raw(sequence_id):
    sequence_type = get_sequence_type()
    try:
        sequence = Entity.get_by(
            entity_type_id=sequence_type["id"],
            id=sequence_id
        )
    except StatementError:
        raise SequenceNotFoundException

    if sequence is None:
        raise SequenceNotFoundException

    return sequence


def get_sequence(sequence_id):
    return get_sequence_raw(sequence_id).serialize(obj_type="Sequence")


def get_full_sequence(sequence_id):
    sequence = get_sequence(sequence_id)
    project = Project.get(sequence["project_id"])
    sequence["project_name"] = project.name

    if sequence["parent_id"] is not None:
        episode = Entity.get(sequence["parent_id"])
        sequence["episode_id"] = str(episode.id)
        sequence["episode_name"] = episode.name

    return sequence


def get_episode_raw(episode_id):
    episode_type = get_episode_type()
    try:
        episode = Entity.get_by(
            entity_type_id=episode_type["id"],
            id=episode_id
        )
    except StatementError:
        raise EpisodeNotFoundException

    if episode is None:
        raise EpisodeNotFoundException
    return episode


def get_episode(episode_id):
    return get_episode_raw(episode_id).serialize(obj_type="Episode")


def get_full_episode(episode_id):
    episode = get_episode(episode_id)
    project = Project.get(episode["project_id"])
    episode["project_name"] = project.name
    return episode


def get_shot_by_shotgun_id(shotgun_id):
    shot_type = get_shot_type()
    shot = Entity.get_by(
        entity_type_id=shot_type["id"],
        shotgun_id=shotgun_id
    )
    if shot is None:
        raise ShotNotFoundException

    return shot.serialize(obj_type="Shot")


def get_scene_by_shotgun_id(shotgun_id):
    scene_type = get_scene_type()
    scene = Entity.get_by(
        entity_type_id=scene_type["id"],
        shotgun_id=shotgun_id
    )
    if scene is None:
        raise SceneNotFoundException

    return scene.serialize(obj_type="Scene")


def get_sequence_by_shotgun_id(shotgun_id):
    sequence_type = get_sequence_type()
    sequence = Entity.get_by(
        entity_type_id=sequence_type["id"],
        shotgun_id=shotgun_id
    )
    if sequence is None:
        raise SequenceNotFoundException

    return sequence.serialize(obj_type="Sequence")


def get_episode_by_shotgun_id(shotgun_id):
    episode_type = get_episode_type()
    episode = Entity.get_by(
        entity_type_id=episode_type["id"],
        shotgun_id=shotgun_id
    )
    if episode is None:
        raise EpisodeNotFoundException

    return episode.serialize(obj_type="Episode")


def is_shot(entity):
    shot_type = get_shot_type()
    return str(entity["entity_type_id"]) == shot_type["id"]


def is_scene(entity):
    scene_type = get_scene_type()
    return str(entity["entity_type_id"]) == scene_type["id"]


def is_sequence(entity):
    sequence_type = get_sequence_type()
    return str(entity["entity_type_id"]) == sequence_type["id"]


def is_episode(entity):
    episode_type = get_episode_type()
    return str(entity["entity_type_id"]) == episode_type["id"]


def get_or_create_episode(project_id, name):
    episode_type = get_episode_type()
    episode = Entity.get_by(
        entity_type_id=episode_type["id"],
        project_id=project_id,
        name=name
    )
    if episode is None:
        episode = Entity(
            entity_type_id=episode_type["id"],
            project_id=project_id,
            name=name
        )
        episode.save()
    return episode.serialize()


def get_or_create_sequence(project_id, episode_id, name):
    sequence_type = get_sequence_type()
    sequence = Entity.get_by(
        entity_type_id=sequence_type["id"],
        parent_id=episode_id,
        project_id=project_id,
        name=name
    )
    if sequence is None:
        sequence = Entity(
            entity_type_id=sequence_type["id"],
            parent_id=episode_id,
            project_id=project_id,
            name=name
        )
        sequence.save()
    return sequence.serialize()


def get_entities_for_project(project_id, entity_type_id, obj_type="Entity"):
    projects_service.get_project_raw(project_id)  # exception if not exists
    result = Entity.query \
        .filter(Entity.entity_type_id == entity_type_id) \
        .filter(Entity.project_id == project_id) \
        .order_by(Entity.name) \
        .all()
    return Entity.serialize_list(result, obj_type=obj_type)


def get_episodes_for_project(project_id):
    return get_entities_for_project(
        project_id,
        get_episode_type()["id"],
        "Episode"
    )


def get_sequences_for_project(project_id):
    return get_entities_for_project(
        project_id,
        get_sequence_type()["id"],
        "Sequence"
    )


def get_shots_for_project(project_id):
    return get_entities_for_project(
        project_id,
        get_shot_type()["id"],
        "Shot"
    )


def get_scenes_for_project(project_id):
    return get_entities_for_project(
        project_id,
        get_scene_type()["id"],
        "Scene"
    )


def get_scenes_for_sequence(sequence_id):
    get_sequence(sequence_id)
    scene_type_id = get_scene_type()["id"]
    result = Entity.query \
        .filter(Entity.entity_type_id == scene_type_id) \
        .filter(Entity.parent_id == sequence_id) \
        .order_by(Entity.name) \
        .all()
    return Entity.serialize_list(result, "Scene")


def remove_shot(shot_id):
    shot = get_shot_raw(shot_id)
    try:
        shot.delete()
    except IntegrityError:
        shot.update({"canceled": True})
    deleted_shot = shot.serialize(obj_type="Shot")
    events.emit("shot:deletion", {"deleted_shot": deleted_shot})
    return deleted_shot


def remove_scene(scene_id):
    scene = get_scene_raw(scene_id)
    try:
        scene.delete()
    except IntegrityError:
        scene.update({"canceled": True})
    deleted_scene = scene.serialize(obj_type="Scene")
    events.emit("scene:deletion", {"deleted_scene": deleted_scene})
    return deleted_scene


def create_episode(project_id, name):
    episode_type = get_episode_type()
    episode = Entity.get_by(
        entity_type_id=episode_type["id"],
        project_id=project_id,
        name=name
    )
    if episode is None:
        episode = Entity.create(
            entity_type_id=episode_type["id"],
            project_id=project_id,
            name=name
        )
    return episode.serialize(obj_type="Episode")


def create_sequence(project_id, episode_id, name):
    sequence_type = get_sequence_type()

    if episode_id is not None:
        get_episode(episode_id)  # raises EpisodeNotFound if it fails.

    sequence = Entity.get_by(
        entity_type_id=sequence_type["id"],
        parent_id=episode_id,
        project_id=project_id,
        name=name
    )
    if sequence is None:
        sequence = Entity.create(
            entity_type_id=sequence_type["id"],
            project_id=project_id,
            parent_id=episode_id,
            name=name
        )
    return sequence.serialize(obj_type="Sequence")


def create_shot(project_id, sequence_id, name, data={}):
    shot_type = get_shot_type()

    if sequence_id is not None:
        get_sequence(sequence_id)  # raises SequenceNotFound if it fails.

    shot = Entity.get_by(
        entity_type_id=shot_type["id"],
        parent_id=sequence_id,
        project_id=project_id,
        name=name
    )
    if shot is None:
        shot = Entity.create(
            entity_type_id=shot_type["id"],
            project_id=project_id,
            parent_id=sequence_id,
            name=name,
            data=data
        )
    return shot.serialize(obj_type="Shot")


def create_scene(project_id, sequence_id, name):
    scene_type = get_scene_type()

    if sequence_id is not None:
        # raises SequenceNotFound if it fails.
        sequence = get_sequence(sequence_id)
        if sequence["project_id"] != project_id:
            raise SequenceNotFoundException

    scene = Entity.get_by(
        entity_type_id=scene_type["id"],
        parent_id=sequence_id,
        project_id=project_id,
        name=name
    )
    if scene is None:
        scene = Entity.create(
            entity_type_id=scene_type["id"],
            project_id=project_id,
            parent_id=sequence_id,
            name=name,
            data={}
        )
    return scene.serialize(obj_type="Scene")


def get_entities_out(shot_id):
    shot = get_shot_raw(shot_id)
    return Entity.serialize_list(shot.entities_out, obj_type="Asset")
