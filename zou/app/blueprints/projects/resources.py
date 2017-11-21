from flask_restful import Resource
from flask_jwt_extended import jwt_required

from zou.app.services import projects_service, user_service
from zou.app.utils import permissions


class OpenProjectsResource(Resource):

    @jwt_required
    def get(self):
        try:
            permissions.check_manager_permissions()
            return projects_service.open_projects()
        except permissions.PermissionDenied:
            return user_service.get_projects()


class AllProjectsResource(Resource):

    @jwt_required
    def get(self):
        try:
            permissions.check_manager_permissions()
            return projects_service.all_projects(), 200
        except permissions.PermissionDenied:
            return user_service.get_projects()
