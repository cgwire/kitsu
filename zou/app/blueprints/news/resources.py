import os

from flask import request

from flask_restful import Resource
from flask_jwt_extended import jwt_required

from zou.app.services import (
    news_service,
    projects_service,
    user_service
)


class ProjectNewsResource(Resource):

    @jwt_required
    def get(self, project_id):
        options = request.args
        page = int(options.get("page", "1"))
        projects_service.get_project(project_id)
        user_service.check_project_access(project_id)
        return news_service.get_last_news_for_project(
            project_id,
            page=page
        )


class ProjectSingleNewsResource(Resource):

    @jwt_required
    def get(self, project_id, news_id):
        projects_service.get_project(project_id)
        user_service.check_project_access(project_id)
        return news_service.get_last_news_for_project(
            project_id,
            news_id=news_id
        )
