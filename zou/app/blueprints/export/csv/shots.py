from flask_restful import Resource
from flask_jwt_extended import jwt_required

from zou.app.services import (
    shots_service,
    projects_service,
    tasks_service,
    user_service
)
from zou.app.utils import csv_utils


class ShotsCsvExport(Resource):

    @jwt_required
    def get(self, project_id):
        project = projects_service.get_project(project_id)
        self.check_permissions(project["id"])

        self.task_status_map = tasks_service.get_task_status_map()
        self.task_type_map = tasks_service.get_task_type_map()

        csv_content = []
        results = self.get_shots_data(project_id)
        validation_columns = self.get_validation_columns(results)
        csv_content.append(self.build_headers(validation_columns))

        for result in results:
            result["project_name"] = project["name"]
            csv_content.append(self.build_row(result, validation_columns))

        file_name = "%s shots" % project["name"]
        return csv_utils.build_csv_response(csv_content, file_name)

    def check_permissions(self, project_id):
        user_service.check_project_access(project_id)

    def build_headers(self, validation_columns):
        headers = [
            "Project",
            "Episode",
            "Sequence",
            "Name",
            "Description",
            "Frame In",
            "Frame Out"
        ]
        return headers + validation_columns

    def get_shots_data(self, project_id):
        results = shots_service.get_shots_and_tasks({
            "project_id": project_id
        })
        return sorted(
            results,
            key=lambda shot: (
                shot["episode_name"],
                shot["sequence_name"],
                shot["name"]
            )
        )

    def get_validation_columns(self, results):
        validation_map = {}

        for result in results:
            for task in result["tasks"]:
                task_type = self.task_type_map[task["task_type_id"]]
                validation_map[task_type["name"]] = {
                    "name": task_type["name"],
                    "priority": task_type["priority"]
                }

        validation_columns = [
            validation["name"] for validation in sorted(
                validation_map.values(),
                key=lambda validation: (
                    validation["priority"],
                    validation["name"]
                )
            )
        ]

        return validation_columns

    def build_row(self, result, validation_columns):
        row = [
            result["project_name"],
            result["episode_name"],
            result["sequence_name"],
            result["name"],
            result["description"],
            result.get("data", {}).get("frame_in", ""),
            result.get("data", {}).get("frame_out", "")
        ]
        task_map = {}

        for task in result["tasks"]:
            task_status = self.task_status_map[task["task_status_id"]]
            task_type = self.task_type_map[task["task_type_id"]]
            task_map[task_type["name"]] = task_status["short_name"]

        for column in validation_columns:
            row.append(task_map.get(column, ""))

        return row
