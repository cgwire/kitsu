from zou.app.models.project import Project
from zou.app.models.project_status import ProjectStatus
from zou.app.services.exception import ProjectNotFoundException

from zou.app.utils import fields

from sqlalchemy.exc import StatementError


def open_projects():
    query = ProjectStatus.query
    query = query.filter(ProjectStatus.name.in_(("Active", "open", "Open")))
    statuses = query.all()
    status_ids = [x.id for x in statuses]

    query = Project.query.filter(Project.project_status_id.in_(status_ids))
    return fields.serialize_value(query.all())


def all_projects():
    result = []
    query = Project.query.join(ProjectStatus)
    query = query.add_columns(ProjectStatus.name)
    query = query.order_by(Project.name)
    entries = query.all()

    for entry in entries:
        (project, project_status_name) = entry
        data = project.serialize()
        data["project_status_name"] = project_status_name
        result.append(data)

    return result


def get_or_create_open_status():
    return get_or_create_status("Open")


def get_open_status():
    get_or_create_status("Open")


def get_closed_status():
    get_or_create_status("Closed")


def get_or_create_status(name):
    project_status = ProjectStatus.get_by(name=name)
    if project_status is None:
        project_status = ProjectStatus(
            name=name,
            color="#000000"
        )
        project_status.save()
    return project_status.serialize()


def save_project_status(project_statuses):
    result = []
    filtered_satuses = (x for x in project_statuses if x is not None)

    for status in filtered_satuses:
        project_status = get_or_create_status(status)
        result.append(project_status)
    return result


def get_or_create(name):
    project = Project.get_by(name=name)
    if project is None:
        open_status = get_or_create_open_status()
        project = Project(
            name=name,
            project_status_id=open_status["id"]
        )
        project.save()
    return project.serialize()


def get_project_by_name(project_name):
    project = Project.get_by(name=project_name)

    if project is None:
        raise ProjectNotFoundException()

    return project.serialize()


def get_project_raw(project_id):
    try:
        project = Project.get(project_id)
    except StatementError:
        raise ProjectNotFoundException()

    if project is None:
        raise ProjectNotFoundException()

    return project


def get_project(project_id):
    return get_project_raw(project_id).serialize()


def update_project(project_id, data):
    project = get_project_raw(project_id)
    project.update(data)
    return project.serialize()
