from flask_restful import Resource
from flask_jwt_extended import jwt_required

from zou.app.services import projects_service
from zou.app.utils import fields


class OpenProjectsResource(Resource):

    @jwt_required
    def get(self):
        return fields.serialize_models(projects_service.open_projects())


class AllProjectsResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @jwt_required
    def get(self):
        return projects_service.all_projects(), 200
