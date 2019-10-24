import re

from sqlalchemy import func
from sqlalchemy.orm import aliased
from sqlalchemy.exc import IntegrityError, StatementError

from zou.app.utils import events, fields, cache, query as query_utils

from zou.app.models.entity import Entity
from zou.app.models.project import Project
from zou.app.models.subscription import Subscription
from zou.app.models.task import Task
from zou.app.models.task import assignees_table
from zou.app.models.task_status import TaskStatus

from zou.app.services import (
    deletion_service,
    entities_service,
    projects_service,
)
from zou.app.services.exception import (
    EpisodeNotFoundException,
    SequenceNotFoundException,
    SceneNotFoundException,
    ShotNotFoundException,
    WrongIdFormatException,
)


def clear_shot_cache(shot_id):
    cache.cache.delete_memoized(get_shot, shot_id)
    cache.cache.delete_memoized(get_full_shot, shot_id)


def get_temporal_entity_type_by_name(name):
    entity_type = entities_service.get_entity_type_by_name(name)
    if entity_type is None:
        cache.cache.delete_memoized(
            entities_service.get_entity_type_by_name, name
        )
        entity_type = entities_service.get_entity_type_by_name(name)
    return entity_type


@cache.memoize_function(1200)
def get_episode_type():
    return get_temporal_entity_type_by_name("Episode")


@cache.memoize_function(1200)
def get_sequence_type():
    return get_temporal_entity_type_by_name("Sequence")


@cache.memoize_function(1200)
def get_shot_type():
    return get_temporal_entity_type_by_name("Shot")


@cache.memoize_function(1200)
def get_scene_type():
    return get_temporal_entity_type_by_name("Scene")


@cache.memoize_function(1200)
def get_camera_type():
    return entities_service.get_entity_type_by_name("Camera")


def get_episodes(criterions={}):
    """
    Get all episodes for given criterions.
    """
    episode_type = get_episode_type()
    criterions["entity_type_id"] = episode_type["id"]
    query = Entity.query.order_by(Entity.name)
    query = query_utils.apply_criterions_to_db_query(Entity, query, criterions)
    try:
        episodes = query.all()
    except StatementError:  # Occurs when an id is not properly formatted
        raise WrongIdFormatException
    return Entity.serialize_list(episodes, obj_type="Episode")


def get_sequences(criterions={}):
    """
    Get all sequences for given criterions.
    """
    sequence_type = get_sequence_type()
    criterions["entity_type_id"] = sequence_type["id"]
    query = Entity.query.order_by(Entity.name)
    query = query_utils.apply_criterions_to_db_query(Entity, query, criterions)
    try:
        sequences = query.all()
    except StatementError:  # Occurs when an id is not properly formatted
        raise WrongIdFormatException
    return Entity.serialize_list(sequences, obj_type="Sequence")


def get_shots(criterions={}):
    """
    Get all shots for given criterions.
    """
    shot_type = get_shot_type()
    criterions["entity_type_id"] = shot_type["id"]
    Sequence = aliased(Entity, name="sequence")
    query = Entity.query
    query = query_utils.apply_criterions_to_db_query(Entity, query, criterions)
    query = (
        query.join(Project)
        .join(Sequence, Sequence.id == Entity.parent_id)
        .add_columns(Project.name)
        .add_columns(Sequence.name)
        .order_by(Entity.name)
    )
    try:
        data = query.all()
    except StatementError:  # Occurs when an id is not properly formatted
        raise WrongIdFormatException

    shots = []
    for (shot_model, project_name, sequence_name) in data:
        shot = shot_model.serialize(obj_type="Shot")
        shot["project_name"] = project_name
        shot["sequence_name"] = sequence_name
        shots.append(shot)

    return shots


def get_scenes(criterions={}):
    """
    Get all scenes for given criterions.
    """
    scene_type = get_scene_type()
    criterions["entity_type_id"] = scene_type["id"]
    Sequence = aliased(Entity, name="sequence")

    query = Entity.query
    query = query_utils.apply_criterions_to_db_query(Entity, query, criterions)
    query = (
        query.join(Project)
        .join(Sequence, Sequence.id == Entity.parent_id)
        .add_columns(Project.name)
        .add_columns(Sequence.name)
    )
    try:
        data = query.all()
    except StatementError:  # Occurs when an id is not properly formatted
        raise WrongIdFormatException

    scenes = []
    for (scene_model, project_name, sequence_name) in data:
        scene = scene_model.serialize(obj_type="Scene")
        scene["project_name"] = project_name
        scene["sequence_name"] = sequence_name
        scenes.append(scene)

    return scenes


def get_episode_map(criterions={}):
    """
    Returns a dict where keys are episode_id and values are episodes.
    """
    episodes = get_episodes(criterions)
    episode_map = {}
    for episode in episodes:
        episode_map[episode["id"]] = episode
    return episode_map


def get_shots_and_tasks(criterions={}):
    """
    Get all shots for given criterions with related tasks for each shot.
    """
    shot_type = get_shot_type()
    shot_map = {}
    task_map = {}

    Sequence = aliased(Entity, name="sequence")
    Episode = aliased(Entity, name="episode")

    query = (
        Entity.query.join(Project)
        .join(Sequence, Sequence.id == Entity.parent_id)
        .outerjoin(Episode, Episode.id == Sequence.parent_id)
        .outerjoin(Task, Task.entity_id == Entity.id)
        .outerjoin(assignees_table)
        .add_columns(
            Episode.name,
            Episode.id,
            Sequence.name,
            Sequence.id,
            Task.id,
            Task.task_type_id,
            Task.task_status_id,
            Task.priority,
            Task.estimation,
            Task.duration,
            Task.retake_count,
            Task.real_start_date,
            Task.end_date,
            Task.start_date,
            Task.due_date,
            Task.last_comment_date,
            assignees_table.columns.person,
            Project.id,
            Project.name,
        )
        .filter(Entity.entity_type_id == shot_type["id"])
    )
    if "id" in criterions:
        query = query.filter(Entity.id == criterions["id"])

    if "project_id" in criterions:
        query = query.filter(Entity.project_id == criterions["project_id"])

    if "episode_id" in criterions:
        query = query.filter(Sequence.parent_id == criterions["episode_id"])

    for (
        shot,
        episode_name,
        episode_id,
        sequence_name,
        sequence_id,
        task_id,
        task_type_id,
        task_status_id,
        task_priority,
        task_estimation,
        task_duration,
        task_retake_count,
        task_real_start_date,
        task_end_date,
        task_start_date,
        task_due_date,
        task_last_comment_date,
        person_id,
        project_id,
        project_name,
    ) in query.all():
        shot_id = str(shot.id)

        shot.data = shot.data or {}

        if shot_id not in shot_map:

            shot_map[shot_id] = {
                "canceled": shot.canceled,
                "data": fields.serialize_value(shot.data),
                "description": shot.description,
                "entity_type_id": str(shot.entity_type_id),
                "episode_id": str(episode_id),
                "episode_name": episode_name or "",
                "fps": shot.data.get("fps", None),
                "frame_in": shot.data.get("frame_in", None),
                "frame_out": shot.data.get("frame_out", None),
                "id": str(shot.id),
                "name": shot.name,
                "nb_frames": shot.nb_frames,
                "parent_id": str(shot.parent_id),
                "preview_file_id": str(shot.preview_file_id or ""),
                "project_id": str(project_id),
                "project_name": project_name,
                "sequence_id": str(sequence_id),
                "sequence_name": sequence_name,
                "source_id": str(shot.source_id),
                "tasks": [],
                "type": "Shot",
            }

        if task_id is not None:
            if task_id not in task_map:
                task_dict = {
                    "id": str(task_id),
                    "entity_id": shot_id,
                    "task_status_id": str(task_status_id),
                    "task_type_id": str(task_type_id),
                    "priority": task_priority or 0,
                    "estimation": task_estimation,
                    "duration": task_duration,
                    "retake_count": task_retake_count,
                    "real_start_date": fields.serialize_value(
                        task_real_start_date
                    ),
                    "end_date": fields.serialize_value(task_end_date),
                    "start_date": fields.serialize_value(task_start_date),
                    "due_date": fields.serialize_value(task_due_date),
                    "last_comment_date": fields.serialize_value(
                        task_last_comment_date
                    ),
                    "assignees": [],
                }
                task_map[task_id] = task_dict
                shot_dict = shot_map[shot_id]
                shot_dict["tasks"].append(task_dict)

            if person_id:
                task_map[task_id]["assignees"].append(str(person_id))

    return list(shot_map.values())


def get_shot_raw(shot_id):
    """
    Return given shot as an active record.
    """
    shot_type = get_shot_type()
    try:
        shot = Entity.get_by(entity_type_id=shot_type["id"], id=shot_id)
    except StatementError:
        raise SequenceNotFoundException

    if shot is None:
        raise ShotNotFoundException

    return shot


@cache.memoize_function(10)
def get_shot(shot_id):
    """
    Return given shot as a dictionary.
    """
    return get_shot_raw(shot_id).serialize(obj_type="Shot")


@cache.memoize_function(3)
def get_full_shot(shot_id):
    """
    Return given shot as a dictionary with extra data like project and
    sequence names.
    """
    shots = get_shots_and_tasks({"id": shot_id})
    if len(shots) > 0:
        return shots[0]
    else:
        raise ShotNotFoundException


def get_scene_raw(scene_id):
    """
    Return given scene as an active record.
    """
    scene_type = get_scene_type()
    try:
        scene = Entity.get_by(entity_type_id=scene_type["id"], id=scene_id)
    except StatementError:
        raise SceneNotFoundException

    if scene is None:
        raise SceneNotFoundException

    return scene


def get_scene(scene_id):
    """
    Return given scene as a dictionary.
    """
    return get_scene_raw(scene_id).serialize(obj_type="Scene")


def get_full_scene(scene_id):
    """
    Return given scene as a dictionary with extra data like project and sequence
    names.
    """
    scene = get_scene(scene_id)
    project = projects_service.get_project(scene["project_id"])
    sequence = get_sequence(scene["parent_id"])
    scene["project_name"] = project["name"]
    scene["sequence_id"] = sequence["id"]
    scene["sequence_name"] = sequence["name"]
    if sequence["parent_id"] is not None:
        episode = get_episode(sequence["parent_id"])
        scene["episode_id"] = episode["id"]
        scene["episode_name"] = episode["name"]

    return scene


def get_sequence_raw(sequence_id):
    """
    Return given sequence as an active record.
    """
    sequence_type = get_sequence_type()
    try:
        sequence = Entity.get_by(
            entity_type_id=sequence_type["id"], id=sequence_id
        )
    except StatementError:
        raise SequenceNotFoundException

    if sequence is None:
        raise SequenceNotFoundException

    return sequence


def get_sequence(sequence_id):
    """
    Return given sequence as a dictionary.
    """
    return get_sequence_raw(sequence_id).serialize(obj_type="Sequence")


def get_full_sequence(sequence_id):
    """
    Return given sequence as a dictionary with extra data like project name.
    """
    sequence = get_sequence(sequence_id)
    project = projects_service.get_project(sequence["project_id"])
    sequence["project_name"] = project["name"]

    if sequence["parent_id"] is not None:
        episode = get_episode(sequence["parent_id"])
        sequence["episode_id"] = episode["id"]
        sequence["episode_name"] = episode["name"]

    return sequence


def get_sequence_from_shot(shot):
    """
    Return parent sequence of given shot.
    """
    try:
        sequence = Entity.get(shot["parent_id"])
    except:
        raise SequenceNotFoundException("Wrong parent_id for given shot.")
    return sequence.serialize(obj_type="Sequence")


def get_episode_raw(episode_id):
    """
    Return given episode as an active record.
    """
    episode_type = get_episode_type()
    if episode_type is None:
        episode_type = get_episode_type()

    try:
        episode = Entity.get_by(
            entity_type_id=episode_type["id"], id=episode_id
        )
    except StatementError:
        raise EpisodeNotFoundException

    if episode is None:
        raise EpisodeNotFoundException
    return episode


def get_episode(episode_id):
    """
    Return given episode as a dictionary.
    """
    return get_episode_raw(episode_id).serialize(obj_type="Episode")


def get_full_episode(episode_id):
    """
    Return given episode as a dictionary with extra data like project name.
    """
    episode = get_episode(episode_id)
    project = projects_service.get_project(episode["project_id"])
    episode["project_name"] = project["name"]
    return episode


def get_episode_from_sequence(sequence):
    """
    Return parent episode of given sequence.
    """
    try:
        episode = Entity.get(sequence["parent_id"])
    except:
        raise EpisodeNotFoundException("Wrong parent_id for given sequence.")
    return episode.serialize(obj_type="Episode")


def get_shot_by_shotgun_id(shotgun_id):
    """
    Retrieves a shot identifed by its shotgun ID (stored during import).
    """
    shot_type = get_shot_type()
    shot = Entity.get_by(entity_type_id=shot_type["id"], shotgun_id=shotgun_id)
    if shot is None:
        raise ShotNotFoundException

    return shot.serialize(obj_type="Shot")


def get_scene_by_shotgun_id(shotgun_id):
    """
    Retrieves a scene identifed by its shotgun ID (stored during import).
    """
    scene_type = get_scene_type()
    scene = Entity.get_by(
        entity_type_id=scene_type["id"], shotgun_id=shotgun_id
    )
    if scene is None:
        raise SceneNotFoundException

    return scene.serialize(obj_type="Scene")


def get_sequence_by_shotgun_id(shotgun_id):
    """
    Retrieves a sequence identifed by its shotgun ID (stored during import).
    """
    sequence_type = get_sequence_type()
    sequence = Entity.get_by(
        entity_type_id=sequence_type["id"], shotgun_id=shotgun_id
    )
    if sequence is None:
        raise SequenceNotFoundException

    return sequence.serialize(obj_type="Sequence")


def get_episode_by_shotgun_id(shotgun_id):
    """
    Retrieves an episode identifed by its shotgun ID (stored during import).
    """
    episode_type = get_episode_type()
    episode = Entity.get_by(
        entity_type_id=episode_type["id"], shotgun_id=shotgun_id
    )
    if episode is None:
        raise EpisodeNotFoundException

    return episode.serialize(obj_type="Episode")


def is_shot(entity):
    """
    Returns True if given entity has 'Shot' as entity type
    """
    shot_type = get_shot_type()
    return str(entity["entity_type_id"]) == shot_type["id"]


def is_scene(entity):
    """
    Returns True if given entity has 'Scene' as entity type
    """
    scene_type = get_scene_type()
    return str(entity["entity_type_id"]) == scene_type["id"]


def is_sequence(entity):
    """
    Returns True if given entity has 'Sequence' as entity type
    """
    sequence_type = get_sequence_type()
    return str(entity["entity_type_id"]) == sequence_type["id"]


def is_episode(entity):
    """
    Returns True if given entity has 'Episode' as entity type
    """
    episode_type = get_episode_type()
    return str(entity["entity_type_id"]) == episode_type["id"]


def get_or_create_episode(project_id, name):
    """
    Retrieve episode matching given project and name or create it.
    """
    episode_type = get_episode_type()
    episode = Entity.get_by(
        entity_type_id=episode_type["id"], project_id=project_id, name=name
    )
    if episode is None:
        episode = Entity(
            entity_type_id=episode_type["id"], project_id=project_id, name=name
        )
        episode.save()
    return episode.serialize()


def get_or_create_first_episode(project_id):
    """
    Get the first episode of the production.
    """
    episode = (
        Entity.query.filter_by(project_id=project_id)
        .order_by(Entity.name)
        .first()
    )
    if episode is not None:
        return episode.serialize()
    else:
        return get_or_create_episode(project_id, "E01")


def get_or_create_sequence(project_id, episode_id, name):
    """
    Retrieve sequence matching given project, episode and name or create it.
    """
    sequence_type = get_sequence_type()
    sequence = Entity.get_by(
        entity_type_id=sequence_type["id"],
        parent_id=episode_id,
        project_id=project_id,
        name=name,
    )
    if sequence is None:
        sequence = Entity(
            entity_type_id=sequence_type["id"],
            parent_id=episode_id,
            project_id=project_id,
            name=name,
        )
        sequence.save()
    return sequence.serialize()


def get_episodes_for_project(project_id):
    """
    Retrieve all episodes related to given project.
    """
    return entities_service.get_entities_for_project(
        project_id, get_episode_type()["id"], "Episode"
    )


def get_sequences_for_project(project_id):
    """
    Retrieve all sequences related to given project.
    """
    return entities_service.get_entities_for_project(
        project_id, get_sequence_type()["id"], "Sequence"
    )


def get_sequences_for_episode(episode_id):
    """
    Retrieve all sequences related to given episode.
    """
    return get_episodes({"parent_id": episode_id})


def get_shots_for_project(project_id):
    """
    Retrieve all shots related to given project.
    """
    return entities_service.get_entities_for_project(
        project_id, get_shot_type()["id"], "Shot"
    )


def get_scenes_for_project(project_id):
    """
    Retrieve all scenes related to given project.
    """
    return entities_service.get_entities_for_project(
        project_id, get_scene_type()["id"], "Scene"
    )


def get_scenes_for_sequence(sequence_id):
    """
    Retrieve all scenes children of given sequence.
    """
    get_sequence(sequence_id)
    scene_type_id = get_scene_type()["id"]
    result = (
        Entity.query.filter(Entity.entity_type_id == scene_type_id)
        .filter(Entity.parent_id == sequence_id)
        .order_by(Entity.name)
        .all()
    )
    return Entity.serialize_list(result, "Scene")


def remove_shot(shot_id, force=False):
    """
    Remove given shot from database. If it has tasks linked to it, it marks
    the shot as canceled. Deletion can be forced.
    """
    shot = get_shot_raw(shot_id)
    is_tasks_related = Task.query.filter_by(entity_id=shot_id).count() > 0

    if is_tasks_related and not force:
        shot.update({"canceled": True})
        clear_shot_cache(shot_id)
        events.emit("shot:update", {"shot_id": shot_id})
    else:
        from zou.app.services import tasks_service

        tasks = Task.query.filter_by(entity_id=shot_id).all()
        for task in tasks:
            deletion_service.remove_task(task.id, force=True)
            tasks_service.clear_task_cache(str(task.id))

        subscriptions = Subscription.query.filter_by(entity_id=shot_id).all()
        for subscription in subscriptions:
            subscription.delete()

        shot.delete()
        clear_shot_cache(shot_id)
        events.emit("shot:delete", {"shot_id": shot_id})

    deleted_shot = shot.serialize(obj_type="Shot")
    return deleted_shot


def remove_scene(scene_id):
    """
    Remove given scene from database. If it has tasks linked to it, it marks
    the scene as canceled.
    """
    scene = get_scene_raw(scene_id)
    try:
        scene.delete()
    except IntegrityError:
        scene.update({"canceled": True})
    deleted_scene = scene.serialize(obj_type="Scene")
    events.emit("scene:delete", {"scene_id": scene_id})
    return deleted_scene


def create_episode(project_id, name):
    """
    Create episode for given project.
    """
    episode_type = get_episode_type()
    episode = Entity.get_by(
        entity_type_id=episode_type["id"], project_id=project_id, name=name
    )
    if episode is None:
        episode = Entity.create(
            entity_type_id=episode_type["id"], project_id=project_id, name=name
        )
    events.emit(
        "episode:new", {"episode_id": episode.id, "project_id": project_id}
    )
    return episode.serialize(obj_type="Episode")


def create_sequence(project_id, episode_id, name):
    """
    Create sequence for given project and episode.
    """
    sequence_type = get_sequence_type()

    if episode_id is not None:
        get_episode(episode_id)  # raises EpisodeNotFound if it fails.

    sequence = Entity.get_by(
        entity_type_id=sequence_type["id"],
        parent_id=episode_id,
        project_id=project_id,
        name=name,
    )
    if sequence is None:
        sequence = Entity.create(
            entity_type_id=sequence_type["id"],
            project_id=project_id,
            parent_id=episode_id,
            name=name,
        )
    events.emit(
        "sequence:new", {"sequence_id": sequence.id, "project_id": project_id}
    )
    return sequence.serialize(obj_type="Sequence")


def create_shot(project_id, sequence_id, name, data={}):
    """
    Create shot for given project and sequence.
    """
    shot_type = get_shot_type()

    if sequence_id is not None:
        get_sequence(sequence_id)  # raises SequenceNotFound if it fails.

    shot = Entity.get_by(
        entity_type_id=shot_type["id"],
        parent_id=sequence_id,
        project_id=project_id,
        name=name,
    )
    if shot is None:
        shot = Entity.create(
            entity_type_id=shot_type["id"],
            project_id=project_id,
            parent_id=sequence_id,
            name=name,
            data=data,
        )
    events.emit("shot:new", {"shot_id": shot.id, "project_id": project_id})
    return shot.serialize(obj_type="Shot")


def create_scene(project_id, sequence_id, name):
    """
    Create scene for given project and sequence.
    """
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
        name=name,
    )
    if scene is None:
        scene = Entity.create(
            entity_type_id=scene_type["id"],
            project_id=project_id,
            parent_id=sequence_id,
            name=name,
            data={},
        )
    events.emit("scene:new", {"scene_id": scene.id, "project_id": project_id})
    return scene.serialize(obj_type="Scene")


def update_shot(shot_id, data_dict):
    """
    Update shot fields matching given id with data from dict given in parameter.
    """
    shot = get_shot_raw(shot_id)
    shot.update(data_dict)
    clear_shot_cache(shot_id)
    events.emit("shot:update", {"shot_id": shot_id})
    return shot.serialize()


def get_episode_stats_for_project(project_id):
    """
    Retrieve number of tasks by status, task_types and episodes
    for given project.
    """
    Sequence = aliased(Entity, name="sequence")
    Episode = aliased(Entity, name="episode")
    query = (
        Task.query.with_entities(
            Task.project_id,
            Episode.id,
            Task.task_type_id,
            Task.task_status_id,
            TaskStatus.short_name,
            TaskStatus.color,
        )
        .filter(Task.project_id == project_id)
        .join(Project, Project.id == Task.project_id)
        .join(TaskStatus, TaskStatus.id == Task.task_status_id)
        .join(Entity, Entity.id == Task.entity_id)
        .join(Sequence, Sequence.id == Entity.parent_id)
        .join(Episode, Episode.id == Sequence.parent_id)
        .group_by(
            Task.project_id,
            Episode.id,
            Task.task_type_id,
            Task.task_status_id,
            TaskStatus.short_name,
            TaskStatus.color,
        )
        .add_columns(func.count(Task.id))
        .add_columns(func.sum(Entity.nb_frames))
    )

    results = {}
    for data in query.all():
        add_entry_to_stats(results, *data)
        add_entry_to_all_stats(results, *data)
    return results


def add_entry_to_stats(
    results,
    project_id,
    episode_id,
    task_type_id,
    task_status_id,
    task_status_short_name,
    task_status_color,
    task_count,
    entity_nb_frames,
):
    """
    Add to stats results, information of given count for given entity, task
    type and task satus.
    """
    episode_id = str(episode_id)
    task_type_id = str(task_type_id)
    task_status_id = str(task_status_id)
    results.setdefault(episode_id, {})
    results[episode_id].setdefault(task_type_id, {})
    results[episode_id][task_type_id].setdefault(task_status_id, {})
    results[episode_id][task_type_id][task_status_id] = {
        "name": task_status_short_name,
        "color": task_status_color,
        "count": task_count,
        "frames": entity_nb_frames or 0,
    }

    # Aggregate for episode
    results[episode_id].setdefault("all", {})
    results[episode_id]["all"].setdefault(
        task_status_id,
        {
            "name": task_status_short_name,
            "color": task_status_color,
            "count": 0,
            "frames": 0,
        },
    )
    results[episode_id]["all"][task_status_id]["count"] += task_count or 0
    results[episode_id]["all"][task_status_id]["frames"] += (
        entity_nb_frames or 0
    )


def add_entry_to_all_stats(
    results,
    project_id,
    episode_id,
    task_type_id,
    task_status_id,
    task_status_short_name,
    task_status_color,
    task_count,
    entity_nb_frames,
):
    """
    Add to aggregated entry of stats results, information of given count for
    given entity, task type and task satus.
    """
    task_type_id = str(task_type_id)
    task_status_id = str(task_status_id)
    results.setdefault("all", {"all": {}})

    results["all"].setdefault(task_type_id, {})
    results["all"][task_type_id].setdefault(
        task_status_id,
        {
            "name": task_status_short_name,
            "color": task_status_color,
            "count": 0,
            "frames": 0,
        },
    )
    results["all"][task_type_id][task_status_id]["count"] += task_count or 0
    results["all"][task_type_id][task_status_id]["frames"] += (
        entity_nb_frames or 0
    )

    results["all"]["all"].setdefault(
        task_status_id,
        {
            "name": task_status_short_name,
            "color": task_status_color,
            "count": 0,
            "frames": 0,
        },
    )
    results["all"]["all"][task_status_id]["count"] += task_count or 0
    results["all"]["all"][task_status_id]["frames"] += entity_nb_frames or 0


def get_preview_dimensions(project):
    """
    Return dimensions set at project level or default dimensions if the
    dimensions are not set.
    """
    resolution = project["resolution"]
    height = 1080
    width = None
    if resolution is not None and bool(re.match(r"\d*x\d*", resolution)):
        [width, height] = resolution.split("x")
        width = int(width)
        height = int(height)
    return (width, height)


def get_preview_fps(project):
    """
    Return fps set at project level or default fps if the dimensions are not
    set.
    """
    fps = "24.00"
    if project["fps"] is not None:
        fps = "%.2f" % float(project["fps"].replace(",", "."))
    return fps
