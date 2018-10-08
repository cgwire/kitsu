from flask_restful import Resource
from flask_jwt_extended import jwt_required

from flask import request

from zou.app.mixin import ArgsMixin
from zou.app.services import projects_service, user_service
from zou.app.utils import permissions, fields


class OpenProjectsResource(Resource):
    """
    Return the list of projects currently running. Most of the time, past
    projects are not needed.
    """

    @jwt_required
    def get(self):
        name = request.args.get("name", None)
        try:
            permissions.check_admin_permissions()
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
            permissions.check_admin_permissions()

            if name is None:
                return projects_service.get_projects()
            else:
                return [projects_service.get_project_by_name(name)]
        except permissions.PermissionDenied:
            if name is None:
                return user_service.get_projects()
            else:
                return [user_service.get_project_by_name(name)]


class ProductionTeamResource(Resource, ArgsMixin):
    """
    Allow to manage the people listed in a production team.
    """

    @jwt_required
    def get(self, project_id):
        user_service.check_project_access(project_id)
        project = projects_service.get_project()
        return fields.serialize_value(project.team)

    @jwt_required
    def post(self, project_id):
        args = self.get_args([
            ("person_id", "", True)
        ])
        user_service.check_manager_project_access(project_id)
        return projects_service.add_team_member(
            project_id,
            args["person_id"]
        ), 201


class ProductionTeamRemoveResource(Resource, ArgsMixin):
    """
    Allow to remove people listed in a production team.
    """

    @jwt_required
    def delete(self, project_id, person_id):
        user_service.check_manager_project_access(project_id)
        project = projects_service.remove_team_member(project_id, person_id)
        return fields.serialize_value(project), 204
