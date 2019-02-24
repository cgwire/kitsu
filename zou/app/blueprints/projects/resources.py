from flask_restful import Resource
from flask_jwt_extended import jwt_required

from flask import request

from zou.app.mixin import ArgsMixin
from zou.app.services import projects_service, user_service
from zou.app.utils import permissions, fields
from zou.app.services.exception import WrongParameterException


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


class ProductionTeamRemoveResource(Resource):
    """
    Allow to remove people listed in a production team.
    """

    @jwt_required
    def delete(self, project_id, person_id):
        user_service.check_manager_project_access(project_id)
        project = projects_service.remove_team_member(project_id, person_id)
        return '', 204


class ProductionMetadataDescriptorsResource(Resource, ArgsMixin):
    """
    Resource to get and create metadata descriptors. It serves to describe
    extra fields listed in the data attribute of entities.
    """

    @jwt_required
    def get(self, project_id):
        user_service.check_manager_project_access(project_id)
        return projects_service.get_metadata_descriptors(project_id)

    @jwt_required
    def post(self, project_id):
        args = self.get_args([
            ("entity_type", "Asset", False),
            ("name", "", True),
            ("choices", [], False, "append")
        ])
        permissions.check_admin_permissions()

        if args["entity_type"] not in ["Asset", "Shot"]:
            raise WrongParameterException(
                "Wrong entity type. Please select Asset or Shot."
            )

        if len(args["name"]) == 0:
            raise WrongParameterException(
                "Name cannot be empty.",
            )

        return projects_service.add_metadata_descriptor(
            project_id,
            args["entity_type"],
            args["name"],
            args["choices"]
        ), 201


class ProductionMetadataDescriptorResource(Resource, ArgsMixin):
    """
    Resource to get, update or delete a metadata descriptor. Descriptors serve
    to describe extra fields listed in the data attribute of entities.
    """

    @jwt_required
    def get(self, project_id, descriptor_id):
        user_service.check_manager_project_access(project_id)
        return projects_service.get_metadata_descriptor(descriptor_id)

    @jwt_required
    def put(self, project_id, descriptor_id):
        args = self.get_args([
            ("name", "", False),
            ("choices", [], False, "append")
        ])
        permissions.check_admin_permissions()

        if len(args["name"]) == 0:
            raise WrongParameterException("Name cannot be empty.")

        return projects_service.update_metadata_descriptor(descriptor_id, args)

    @jwt_required
    def delete(self, project_id, descriptor_id):
        permissions.check_admin_permissions()
        projects_service.remove_metadata_descriptor(descriptor_id)
        return '', 204
