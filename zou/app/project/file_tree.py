import os
import re
import json

from slugify import slugify

from zou.app import app

from zou.app.models.project import Project
from zou.app.models.entity import Entity
from zou.app.models.entity_type import EntityType
from zou.app.models.task_type import TaskType
from zou.app.models.task import Task
from zou.app.models.department import Department

from zou.app.project import shot_info, task_info
from zou.app.project.exception import (
    MalformedFileTreeException,
    WrongFileTreeFileException,
    WrongPathFormatException,
    TaskNotFoundException
)


def get_file_path(task, mode="working", version=1, comment="", sep=os.sep):
    file_name = get_file_name(task, mode, version, comment)
    folder = get_folder_path(task, mode, sep)

    return join_path(folder, file_name, sep)


def get_file_name(task, mode="output", version=1, comment=""):
    entity = Entity.get(task.entity_id)
    project = get_project(entity)
    tree = get_tree_from_project(project)

    file_name = get_file_name_root(tree, mode, entity, task)
    file_name = add_version_suffix_to_file_name(file_name, version)
    file_name = add_comment_suffix_to_file_name(file_name, comment)

    return u"%s" % file_name


def get_folder_path(task, mode="working", sep=os.sep):
    entity = Entity.get(task.entity_id)
    project = get_project(entity)
    tree = get_tree_from_project(project)
    root_path = get_root_path(tree, mode, sep)
    style = tree[mode]["folder_path"].get("style", "")

    folder_template = get_folder_path_template(tree, mode, entity)
    folder_path = update_variable(folder_template, entity, task, style)
    folder_path = change_folder_path_separators(folder_path, sep)

    return join_path(root_path, folder_path, "")


def get_project(entity):
    return Project.get(entity.project_id)


def get_tree_from_project(project):
    return project.file_tree


def get_tree_from_file(tree_name):
    try:
        tree_path = os.path.join(
            app.config["FILE_TREE_FOLDER"], "%s.json" % tree_name)
        tree_string = open(tree_path).read()
    except IOError:
        raise WrongFileTreeFileException("File Tree file not found.")
    return json.loads(tree_string)


def get_folder_path_template(tree, mode, entity):
    if shot_info.is_shot(entity):
        return tree[mode]["folder_path"]["shot"]
    else:
        return tree[mode]["folder_path"]["asset"]


def get_file_name_template(tree, mode, entity):
    if shot_info.is_shot(entity):
        return tree[mode]["file_name"]["shot"]
    else:
        return tree[mode]["file_name"]["asset"]


def get_file_name_root(tree, mode, entity, task):
    file_name = get_file_name_template(tree, mode, entity)
    file_name = update_variable(file_name, entity, task)
    file_name = slugify(file_name, separator="_")
    file_name = apply_style(file_name, tree[mode]["file_name"].get("style", ""))
    return file_name


def add_version_suffix_to_file_name(file_name, version=1):
    file_name = "%s_v%s" % (file_name, str(version).zfill(3))
    return file_name


def add_comment_suffix_to_file_name(file_name, comment=""):
    if len(comment) > 0:
        file_name = "%s_%s" % (file_name, slugify(comment, separator="_"))
    return file_name


def change_folder_path_separators(folder_path, sep):
    return folder_path.replace("/", sep)


def get_root_path(tree, mode, sep):
    try:
        mountpoint = tree[mode]["mountpoint"]
        root = tree[mode]["root"]
    except KeyError:
        raise MalformedFileTreeException("Can't find given mode in given tree.")
    return "%s%s%s%s" % (mountpoint, sep, root, sep)


def update_variable(name, entity, task, style="lowercase"):
    variables = re.findall('<(\w*)>', name)

    for variable in variables:
        value = get_folder_from_datatype(variable, entity, task)
        name = name.replace(
            "<%s>" % variable,
            apply_style(slugify(value, separator="_"), style)
        )

    return name


def get_folder_from_datatype(datatype, entity, task):
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
        folder = get_folder_from_asset_type(entity)
    elif datatype == "Sequence":
        folder = get_folder_from_sequence(entity)
    elif datatype == "Asset":
        folder = get_folder_from_asset(entity)
    else:
        raise MalformedFileTreeException("Unknown data type.")

    return folder


def get_folder_from_project(entity):
    project = get_project(entity)
    return project.name


def get_folder_from_task(task):
    return task.name


def get_folder_from_shot(shot):
    return shot.name


def get_folder_from_department(task):
    folder = ""
    task_type = TaskType.get(task.task_type_id)
    if task_type is not None:
        task_type = task_info.get_department_from_task_type(task_type)
        folder = task_type.name
    return folder


def get_folder_from_task_type(task):
    folder = ""
    task_type = TaskType.get(task.task_type_id)
    if task_type is not None:
        folder = task_type.name
    return folder


def get_folder_from_asset(asset):
    folder = ""
    if asset is not None:
        folder = asset.name
    return folder


def get_folder_from_sequence(shot):
    sequence = shot_info.get_sequence_from_shot(shot)
    sequence_name = sequence.name
    if "Seq" in sequence_name:
        sequence_number = sequence.name[3:]
        sequence_name = "S%s" % sequence_number.zfill(3)
    return sequence_name


def get_folder_from_asset_type(asset):
    if asset is not None:
        asset_type = EntityType.get(asset.entity_type_id)
        folder = asset_type.name
    else:
        raise MalformedFileTreeException("Given asset is null.")
    return folder


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

    return task


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

    return task


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
            entity_type_id=shot_info.get_episode_type().id,
            project_id=project.id
        )
        if episode is not None:
            episode_id = episode.id

    sequence_id = None
    if len(sequence_name) > 0:
        sequence = Entity.get_by(
            name=sequence_name,
            entity_type_id=shot_info.get_sequence_type().id,
            parent_id=episode_id,
            project_id=project.id
        )
        if sequence is not None:
            sequence_id = sequence.id
    else:
        sequence_id = None

    if len(shot_name) > 0:
        shot = Entity.get_by(
            name=shot_name,
            entity_type_id=shot_info.get_shot_type().id,
            parent_id=sequence_id,
            project_id=project.id
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
            project_id=project.id
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
