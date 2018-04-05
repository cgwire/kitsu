from flask_restful import Resource
from flask_jwt_extended import jwt_required

from flask import request

from zou.app.services import projects_service, user_service
from zou.app.utils import permissions


class OpenProjectsResource(Resource):
    """
    Return the list of projects currently running. Most of the time, past
    projects are not needed.
    """

    @jwt_required
    def get(self):
        name = request.args.get("name", None)
        try:
            permissions.check_manager_permissions()

            return projects_service.open_projects(name=name)
        except permissions.PermissionDenied:
            return user_service.get_open_projects(name=name)


class AllProjectsResource(Resource):
    """
    Return all projects listed in database. Ensure that user has at least
    the manager level before that.
    """

    @jwt_required
    def get(self):
        name = request.args.get("name", None)
        try:
            permissions.check_manager_permissions()

            if name is None:
                return projects_service.get_projects()
            else:
                return [projects_service.get_project_by_name(name)]
        except permissions.PermissionDenied:
            if name is None:
                return user_service.get_projects()
            else:
                return [user_service.get_project_by_name(name)]
