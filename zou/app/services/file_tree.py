import os
import re
import json

from slugify import slugify

from zou.app import app

from zou.app.models.entity import Entity
from zou.app.models.entity_type import EntityType
from zou.app.models.task_type import TaskType
from zou.app.models.task import Task
from zou.app.models.department import Department

from zou.app.services import (
    assets_service,
    files_service,
    shots_service,
    projects_service,
    tasks_service
)
from zou.app.services.exception import (
    MalformedFileTreeException,
    WrongFileTreeFileException,
    WrongPathFormatException,
    TaskNotFoundException
)


def get_file_path(
    task,
    mode="working",
    software=None,
    output_type=None,
    name="",
    version=1,
    sep=os.sep
):
    file_name = get_file_name(
        task,
        mode=mode,
        software=software,
        output_type=output_type,
        name=name,
        version=version,
    )
    folder = get_folder_path(
        task,
        mode,
        software=software,
        output_type=output_type,
        name=name,
        sep=sep
    )

    return join_path(folder, file_name, sep)


def get_file_name(
    task,
    mode="working",
    software=None,
    output_type=None,
    name="",
    version=1
):
    entity = tasks_service.get_entity(task["entity_id"])
    project = get_project(entity)
    tree = get_tree_from_project(project)

    file_name = get_file_name_root(
        tree,
        mode,
        entity,
        task,
        software,
        output_type,
        name
    )
    file_name = add_version_suffix_to_file_name(file_name, version)

    return u"%s" % file_name


def get_instance_file_name(
    asset_instance,
    output_type,
    mode="output",
    name="",
    version=1
):
    shot = tasks_service.get_entity(asset_instance["shot_id"])
    asset = tasks_service.get_entity(asset_instance["asset_id"])
    project = get_project(shot)
    tree = get_tree_from_project(project)

    file_name = get_file_name_root(
        tree,
        mode,
        shot,
        None,
        None,
        output_type,
        name,
        asset_instance=asset_instance,
        asset=asset
    )
    file_name = add_version_suffix_to_file_name(file_name, version)

    return u"%s" % file_name


def get_folder_path(
    task,
    mode="working",
    software=None,
    output_type=None,
    name="",
    sep=os.sep
):
    entity = tasks_service.get_entity(task["entity_id"])
    project = get_project(entity)
    tree = get_tree_from_project(project)
    root_path = get_root_path(tree, mode, sep)
    style = tree[mode]["folder_path"].get("style", "")

    folder_template = get_folder_path_template(tree, mode, entity)
    folder_path = update_variable(
        folder_template,
        entity,
        task,
        software,
        output_type,
        name,
        style
    )
    folder_path = change_folder_path_separators(folder_path, sep)

    return join_path(root_path, folder_path, "")


def get_instance_folder_path(
    asset_instance,
    output_type,
    mode="output",
    sep=os.sep,
):
    shot = tasks_service.get_entity(asset_instance["shot_id"])
    asset = tasks_service.get_entity(asset_instance["asset_id"])
    project = get_project(shot)
    tree = get_tree_from_project(project)
    root_path = get_root_path(tree, mode, sep)
    style = tree[mode]["folder_path"].get("style", "")

    folder_template = get_folder_path_template(
        tree,
        mode,
        asset_instance
    )

    folder_path = update_variable(
        folder_template,
        shot,
        None,
        None,
        output_type,
        "",
        style,
        asset_instance=asset_instance,
        asset=asset
    )
    folder_path = change_folder_path_separators(folder_path, sep)

    return join_path(root_path, folder_path, "")


def get_project(entity):
    return projects_service.get_project(entity["project_id"])


def get_tree_from_project(project):
    return project["file_tree"]


def get_tree_from_file(tree_name):
    try:
        tree_path = os.path.join(
            app.config["FILE_TREE_FOLDER"], "%s.json" % tree_name)
        tree_string = open(tree_path).read()
    except IOError:
        raise WrongFileTreeFileException(
            "File Tree file not found: %s." % tree_path
        )
    return json.loads(tree_string)


def get_folder_path_template(tree, mode, entity):
    try:
        if entity["type"] == "AssetInstance":
            return tree[mode]["folder_path"]["instance"]
        elif shots_service.is_shot(entity):
            return tree[mode]["folder_path"]["shot"]
        elif shots_service.is_sequence(entity):
            return tree[mode]["folder_path"]["sequence"]
        elif shots_service.is_scene(entity):
            return tree[mode]["folder_path"]["scene"]
        else:
            return tree[mode]["folder_path"]["asset"]
    except KeyError:
        raise MalformedFileTreeException


def get_file_name_template(tree, mode, entity):
    try:
        if entity["type"] == "AssetInstance":
            return tree[mode]["file_name"]["instance"]
        elif shots_service.is_shot(entity):
            return tree[mode]["file_name"]["shot"]
        elif shots_service.is_sequence(entity):
            return tree[mode]["file_name"]["sequence"]
        elif shots_service.is_scene(entity):
            return tree[mode]["file_name"]["scene"]
        else:
            return tree[mode]["file_name"]["asset"]
    except KeyError:
        raise MalformedFileTreeException


def get_file_name_root(
    tree,
    mode,
    entity,
    task,
    software,
    output_type,
    name,
    asset_instance=None,
    asset=None
):
    if asset_instance is None:
        file_name_template = get_file_name_template(tree, mode, entity)
    else:
        file_name_template = get_file_name_template(tree, mode, asset_instance)

    file_name = update_variable(
        file_name_template,
        entity,
        task,
        software,
        output_type,
        name,
        asset_instance=asset_instance,
        asset=asset
    )
    file_name = slugify(file_name, separator="_")
    file_name = apply_style(file_name, tree[mode]["file_name"].get("style", ""))
    return file_name


def add_version_suffix_to_file_name(file_name, version=1):
    file_name = "%s_v%s" % (file_name, str(version).zfill(3))
    return file_name


def change_folder_path_separators(folder_path, sep):
    return folder_path.replace("/", sep)


def get_root_path(tree, mode, sep):
    try:
        mountpoint = tree[mode]["mountpoint"]
        root = tree[mode]["root"]
    except KeyError:
        raise MalformedFileTreeException(
            "Can't find given mode (%s) in given tree." % mode
        )
    return "%s%s%s%s" % (mountpoint, sep, root, sep)


def update_variable(
    template,
    entity,
    task,
    software=None,
    output_type=None,
    name="",
    style="lowercase",
    asset_instance=None,
    asset=None
):
    variables = re.findall('<(\w*)>', template)

    render = template
    for variable in variables:
        data = get_folder_from_datatype(
            variable,
            entity,
            task,
            software,
            output_type,
            name,
            asset_instance,
            asset
        )
        render = render.replace(
            "<%s>" % variable,
            apply_style(slugify(data, separator="_"), style)
        )

    return render


def get_folder_from_datatype(
    datatype,
    entity,
    task,
    software=None,
    output_type=None,
    name="",
    instance=None,
    asset=None
):
    if datatype == "Project":
        folder = get_folder_from_project(entity)
    elif datatype == "Task":
        folder = get_folder_from_task(task)
    elif datatype == "TaskType":
        folder = get_folder_from_task_type(task)
    elif datatype == "Department":
        folder = get_folder_from_department(task)
    elif datatype == "Shot":
        folder = get_folder_from_shot(entity)
    elif datatype == "AssetType":
        if asset is None:
            folder = get_folder_from_asset_type(entity)
        else:
            folder = get_folder_from_asset_type(asset)
    elif datatype == "Sequence":
        folder = get_folder_from_sequence(entity)
    elif datatype == "Episode":
        folder = get_folder_from_episode(entity)
    elif datatype == "Asset":
        if asset is None:
            folder = get_folder_from_asset(entity)
        else:
            folder = get_folder_from_asset(asset)
    elif datatype == "Software":
        folder = get_folder_from_software(software)
    elif datatype == "OutputType":
        folder = get_folder_from_output_type(output_type)
    elif datatype == "Scene":
        folder = get_folder_from_scene(entity)
    elif datatype == "Instance":
        folder = get_folder_from_instance(instance)
    elif datatype == "Name":
        folder = name
    else:
        raise MalformedFileTreeException("Unknown data type: %s." % datatype)

    return folder


def get_folder_from_project(entity):
    project = get_project(entity)
    return project["name"]


def get_folder_from_task(task):
    return task["name"]


def get_folder_from_shot(shot):
    return shot["name"]


def get_folder_from_output_type(output_type):
    if output_type is None:
        output_type = files_service.get_or_create_output_type("Geometry")

    return output_type["name"].lower()


def get_folder_from_department(task):
    folder = ""
    department = tasks_service.get_department_from_task(task["id"])
    folder = department["name"]
    return folder


def get_folder_from_task_type(task):
    folder = ""
    task_type = tasks_service.get_task_type(task["task_type_id"])
    if task_type is not None:
        folder = task_type["name"]
    return folder


def get_folder_from_asset(asset):
    folder = ""
    if asset is not None:
        folder = asset["name"]
    return folder


def get_folder_from_sequence(entity):
    if shots_service.is_shot(entity) or shots_service.is_scene(entity):
        sequence = shots_service.get_sequence_from_shot(entity)
        sequence_name = sequence["name"]
    elif shots_service.is_sequence(entity):
        sequence_name = entity["name"]
    else:
        sequence_name = ""

    if "Seq" in sequence_name:
        sequence_number = sequence.name[3:]
        sequence_name = "S%s" % sequence_number.zfill(3)
    return sequence_name


def get_folder_from_episode(entity):
    if shots_service.is_shot(entity) or shots_service.is_scene(entity):
        sequence = shots_service.get_sequence_from_shot(entity)
    elif shots_service.is_sequence(entity):
        sequence = entity

    try:
        episode = shots_service.get_episode_from_sequence(sequence)
        episode_name = episode["name"]
    except:
        episode_name = "e001"

    return episode_name


def get_folder_from_asset_type(asset):
    if asset is not None:
        asset_type = assets_service.get_asset_type(asset["entity_type_id"])
        folder = asset_type["name"]
    else:
        raise MalformedFileTreeException("Given asset is null.")
    return folder


def get_folder_from_software(software):
    if software is None:
        software = files_service.get_or_create_software("3dsmax", "max", ".max")
    return software["name"]


def get_folder_from_scene(scene):
    folder = ""
    if scene is not None:
        folder = scene["name"]
    return folder


def get_folder_from_instance(instance):
    if instance is not None:
        return str(instance["number"])
    else:
        return ""


def join_path(left, right, sep=os.sep):
    if left is "":
        return right
    elif right is "":
        return left
    else:
        return "%s%s%s" % (left, sep, right)


def apply_style(file_name, style):
    if style == "uppercase":
        file_name = file_name.upper()

    elif style == "lowercase":
        file_name = file_name.lower()

    return file_name


class PathTokens(object):
    PROJECT = "Project"
    EPISODE = "Episode"
    SEQUENCE = "Sequence"
    SCENE = "Scene"
    SHOT = "Shot"
    ASSET_TYPE = "AssetType"
    ASSET = "Asset"
    DEPARTMENT = "Department"
    TASK_TYPE = "TaskType"
    TASK = "Task"


def get_shot_task_from_path(file_path, project, mode="working", sep="/"):
    template_elements = get_shot_template_folders(project, mode, sep)
    elements = get_path_folders(project, file_path, mode, sep)

    if len(elements) != len(template_elements):
        tree = get_tree_from_project(project)
        template = get_shot_path_template(tree, mode)
        raise WrongPathFormatException(
            "%s doesn't match %s" % (file_path, template)
        )

    data_names = extract_variable_values_from_path(
        elements,
        template_elements
    )

    shot = guess_shot(
        project,
        data_names.get(PathTokens.EPISODE, ""),
        data_names.get(PathTokens.SEQUENCE, ""),
        data_names.get(PathTokens.SHOT, "")
    )
    task_type = guess_task_type(
        data_names.get(PathTokens.DEPARTMENT, ""),
        data_names.get(PathTokens.TASK_TYPE, ""),
    )
    task = guess_task(
        shot,
        task_type,
        data_names.get(PathTokens.TASK, ""),
    )

    return task.serialize()


def get_asset_task_from_path(file_path, project, mode="working", sep="/"):
    template_elements = get_asset_template_folders(project, mode, sep)
    elements = get_path_folders(project, file_path, mode, sep)

    if len(elements) != len(template_elements):
        tree = get_tree_from_project(project)
        template = get_asset_path_template(tree, mode)
        raise WrongPathFormatException(
            "%s doesn't match %s" % (file_path, template)
        )

    data_names = extract_variable_values_from_path(
        elements,
        template_elements
    )

    asset = guess_asset(
        project,
        data_names.get(PathTokens.ASSET_TYPE, ""),
        data_names.get(PathTokens.ASSET, "")
    )
    task_type = guess_task_type(
        data_names.get(PathTokens.DEPARTMENT, ""),
        data_names.get(PathTokens.TASK_TYPE, ""),
    )
    task = guess_task(
        asset,
        task_type,
        data_names.get(PathTokens.TASK, ""),
    )

    return task.serialize()


def extract_variable_values_from_path(elements, template_elements):
    # TODO: add prefix / suffix handle
    data_names = {}

    for i, template_element in enumerate(template_elements):
        token = re.search("<(\w*)>", template_element)

        if token is not None:
            data_type = token.group()
            data_type = data_type[1:len(data_type) - 1]
            value = elements[i].replace("_", " ")
            value = value.capitalize()
            data_names[data_type] = value

    return data_names


def get_shot_path_template(tree, mode="working"):
    return tree[mode]["folder_path"].get("shot", "")


def get_asset_path_template(tree, mode="working"):
    return tree[mode]["folder_path"].get("asset", "")


def get_shot_template_folders(project, mode="working", sep="/"):
    tree = get_tree_from_project(project)
    template = get_shot_path_template(tree, mode)
    return template.split(sep)


def get_asset_template_folders(project, mode="working", sep="/"):
    tree = get_tree_from_project(project)
    template = get_asset_path_template(tree, mode)
    return template.split(sep)


def get_path_folders(project, file_path, mode="working", sep="/"):
    tree = get_tree_from_project(project)
    root = get_root_path(tree, mode, sep)
    file_path = file_path[len(root):]
    return file_path.split(sep)


def guess_shot(project, episode_name, sequence_name, shot_name):

    episode_id = None
    if len(episode_name) > 0:
        episode = Entity.get_by(
            name=episode_name,
            entity_type_id=shots_service.get_episode_type()["id"],
            project_id=project["id"]
        )
        if episode is not None:
            episode_id = episode.id

    sequence_id = None
    if len(sequence_name) > 0:
        sequence = Entity.get_by(
            name=sequence_name,
            entity_type_id=shots_service.get_sequence_type()["id"],
            parent_id=episode_id,
            project_id=project["id"]
        )
        if sequence is not None:
            sequence_id = sequence.id
    else:
        sequence_id = None

    if len(shot_name) > 0:
        shot = Entity.get_by(
            name=shot_name,
            entity_type_id=shots_service.get_shot_type()["id"],
            parent_id=sequence_id,
            project_id=project["id"]
        )
    else:
        raise WrongPathFormatException(
            "Shot name was not found in given path"
        )
    return shot


def guess_asset(project, asset_type_name, asset_name):

    asset_type_id = None
    if len(asset_type_name) > 0:
        asset_type = EntityType.get_by(
            name=asset_type_name
        )
        if asset_type is not None:
            asset_type_id = asset_type.id

    if len(asset_name) > 0:
        asset = Entity.get_by(
            name=asset_name,
            entity_type_id=asset_type_id,
            project_id=project["id"]
        )
    else:
        raise WrongPathFormatException(
            "Asset name was not found in given path."
        )

    return asset


def guess_task_type(department_name, task_type_name):
    criterions = {
        "name": task_type_name
    }
    if len(department_name) > 0:
        criterions["department_id"] = Department.get_by(name=department_name).id

    return TaskType.get_by(**criterions)


def guess_task(entity, task_type, task_name):
    if entity is None:
        raise WrongPathFormatException(
            "No asset or shot found in given path."
        )

    criterions = {
        "entity_id": entity.id,
        "task_type_id": task_type.id
    }
    if len(task_name) > 0:
        criterions["name"] = task_name

    task = Task.get_by(**criterions)
    if task is None:
        raise TaskNotFoundException
    else:
        return task
