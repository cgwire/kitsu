from flask_restful import Resource, reqparse
from flask_jwt_extended import jwt_required

from zou.app.services import (
    news_service,
    projects_service,
    user_service
)


class ProjectNewsResource(Resource):

    @jwt_required
    def get(self, project_id):
        (
            only_preview,
            task_type_id,
            task_status_id,
            page,
            page_size
        ) = self.get_arguments()
        projects_service.get_project(project_id)
        user_service.check_project_access(project_id)
        return news_service.get_last_news_for_project(
            project_id,
            only_preview=only_preview,
            task_type_id=task_type_id,
            task_status_id=task_status_id,
            page=page,
            page_size=page_size
        )

    def get_arguments(self):
        parser = reqparse.RequestParser()
        parser.add_argument("only_preview", default=False, type=bool)
        parser.add_argument("task_type_id", default=None)
        parser.add_argument("task_status_id", default=None)
        parser.add_argument("page", default=1, type=int)
        parser.add_argument("page_size", default=50, type=int)
        args = parser.parse_args()

        return (
            args["only_preview"],
            args["task_type_id"],
            args["task_status_id"],
            args["page"],
            args["page_size"]
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
