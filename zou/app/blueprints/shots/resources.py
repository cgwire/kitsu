from flask import request, abort
from flask_restful import Resource, reqparse
from flask_jwt_extended import jwt_required

from zou.app.services import (
    breakdown_service,
    shots_service,
    tasks_service,
    projects_service,
    user_service
)
from zou.app.utils import query, permissions

from zou.app.services.exception import (
    EpisodeNotFoundException,
    SequenceNotFoundException,
    ShotNotFoundException,
    ProjectNotFoundException
)


class ShotResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @jwt_required
    def get(self, shot_id):
        """
        Retrieve given shot.
        """
        try:
            shot = shots_service.get_shot(shot_id)
            if not permissions.has_manager_permissions():
                user_service.check_has_task_related(shot["project_id"])
        except ShotNotFoundException:
            abort(404)
        except permissions.PermissionDenied:
            abort(403)

        return shot

    @jwt_required
    def delete(self, shot_id):
        try:
            permissions.check_manager_permissions()
            deleted_shot = shots_service.remove_shot(shot_id)
        except ShotNotFoundException:
            abort(404)
        except permissions.PermissionDenied:
            abort(403)

        return deleted_shot, 204


class ShotsResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @jwt_required
    def get(self):
        """
        Retrieve all shot entries. Filters can be specified in the query string.
        """
        try:
            criterions = query.get_query_criterions_from_request(request)
            if not permissions.has_manager_permissions():
                user_service.check_criterions_has_task_related(criterions)
            return shots_service.get_shots(criterions)
        except permissions.PermissionDenied:
            abort(403)


class ShotAssetsResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @jwt_required
    def get(self, shot_id):
        """
        Retrieve all assets for a given shot.
        """
        try:
            shot = shots_service.get_shot(shot_id)
            if not permissions.has_manager_permissions():
                user_service.check_has_task_related(shot["project_id"])

            return shots_service.get_entities_out(shot_id)
        except ShotNotFoundException:
            abort(404)
        except permissions.PermissionDenied:
            abort(403)


class ShotTaskTypesResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @jwt_required
    def get(self, shot_id):
        """
        Retrieve all task types related to a given shot.
        """
        try:
            shot = shots_service.get_shot(shot_id)
            if not permissions.has_manager_permissions():
                user_service.check_has_task_related(shot["project_id"])
            task_types = tasks_service.get_task_types_for_shot(shot_id)
        except ShotNotFoundException:
            abort(404)
        except permissions.PermissionDenied:
            abort(403)

        return task_types


class ShotTasksResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @jwt_required
    def get(self, shot_id):
        """
        Retrieve all tasks related to a given shot.
        """
        try:
            shot = shots_service.get_shot(shot_id)
            if not permissions.has_manager_permissions():
                user_service.check_has_task_related(shot["project_id"])
        except ShotNotFoundException:
            abort(404)
        except permissions.PermissionDenied:
            abort(403)

        return tasks_service.get_tasks_for_shot(shot_id)


class SequenceTasksResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @jwt_required
    def get(self, sequence_id):
        """
        Retrieve all tasks related to a given shot.
        """
        try:
            sequence = shots_service.get_sequence(sequence_id)
            if not permissions.has_manager_permissions():
                user_service.check_has_task_related(sequence["project_id"])
        except SequenceNotFoundException:
            abort(404)
        except permissions.PermissionDenied:
            abort(403)

        return tasks_service.get_tasks_for_sequence(sequence_id)


class SequenceTaskTypesResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @jwt_required
    def get(self, sequence_id):
        """
        Retrieve all task types related to a given shot.
        """
        try:
            sequence = shots_service.get_sequenc(sequence_id)
            if not permissions.has_manager_permissions():
                user_service.check_has_task_related(sequence["project_id"])
        except SequenceNotFoundException:
            abort(404)
        except permissions.PermissionDenied:
            abort(403)

        return tasks_service.get_task_types_for_sequence(sequence_id)


class ShotsAndTasksResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @jwt_required
    def get(self):
        """
        Retrieve all shots, adds project name and asset type name and all
        related tasks.
        """
        try:
            criterions = query.get_query_criterions_from_request(request)
            if not permissions.has_manager_permissions():
                user_service.check_criterions_has_task_related(criterions)
        except permissions.PermissionDenied:
            abort(403)

        return shots_service.get_shots_and_tasks(criterions)


class ProjectShotsResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @jwt_required
    def get(self, project_id):
        """
        Retrieve all shots related to a given project.
        """
        try:
            projects_service.get_project(project_id)
            if not permissions.has_manager_permissions():
                user_service.check_has_task_related(project_id)
            return shots_service.get_shots_for_project(project_id)
        except ProjectNotFoundException:
            abort(404)
        except permissions.PermissionDenied:
            abort(403)

    @jwt_required
    def post(self, project_id):
        """
        Create a shot for given project.
        """
        try:
            (sequence_id, name) = self.get_arguments()
            projects_service.get_project(project_id)
            permissions.check_manager_permissions()
            shot = shots_service.create_shot(
                project_id,
                sequence_id,
                name
            )
            return shot, 201
        except ProjectNotFoundException:
            abort(404)
        except SequenceNotFoundException:
            abort(404)
        except permissions.PermissionDenied:
            abort(403)

    def get_arguments(self):
        parser = reqparse.RequestParser()
        parser.add_argument("name", required=True)
        parser.add_argument("sequence_id", default=None)
        args = parser.parse_args()
        return (args["sequence_id"], args["name"])


class ProjectSequencesResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @jwt_required
    def get(self, project_id):
        """
        Retrieve all sequences related to a given project.
        """
        try:
            projects_service.get_project(project_id)
            if not permissions.has_manager_permissions():
                user_service.check_has_task_related(project_id)
            return shots_service.get_sequences_for_project(project_id)
        except ProjectNotFoundException:
            abort(404)
        except permissions.PermissionDenied:
            abort(403)

    @jwt_required
    def post(self, project_id):
        """
        Create a sequence for given project.
        """
        try:
            (episode_id, name) = self.get_arguments()
            projects_service.get_project(project_id)
            permissions.check_manager_permissions()
            sequence = shots_service.create_sequence(
                project_id,
                episode_id,
                name
            )
            return sequence, 201
        except ProjectNotFoundException:
            abort(404)
        except EpisodeNotFoundException:
            abort(404)
        except permissions.PermissionDenied:
            abort(403)

    def get_arguments(self):
        parser = reqparse.RequestParser()
        parser.add_argument("name", required=True)
        parser.add_argument("episode_id", default=None)
        args = parser.parse_args()
        return (args["episode_id"], args["name"])


class ProjectEpisodesResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @jwt_required
    def get(self, project_id):
        """
        Retrieve all episodes related to a given project.
        """
        try:
            projects_service.get_project(project_id)
            if not permissions.has_manager_permissions():
                user_service.check_has_task_related(project_id)
            return shots_service.get_episodes_for_project(project_id)
        except ProjectNotFoundException:
            abort(404)
        except permissions.PermissionDenied:
            abort(403)

    @jwt_required
    def post(self, project_id):
        """
        Create an episode for given project.
        """
        try:
            name = self.get_arguments()
            projects_service.get_project(project_id)
            permissions.check_manager_permissions()
            return shots_service.create_episode(project_id, name), 201
        except ProjectNotFoundException:
            abort(404)
        except permissions.PermissionDenied:
            abort(403)

    def get_arguments(self):
        parser = reqparse.RequestParser()
        parser.add_argument("name", required=True)
        args = parser.parse_args()
        return args["name"]


class EpisodeResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @jwt_required
    def get(self, episode_id):
        """
        Retrieve given episode.
        """
        try:
            episode = shots_service.get_episode(episode_id)
            if not permissions.has_manager_permissions():
                user_service.check_has_task_related(episode["project_id"])
            return episode
        except EpisodeNotFoundException:
            abort(404)
        except permissions.PermissionDenied:
            abort(403)


class EpisodesResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @jwt_required
    def get(self):
        """
        Retrieve all episode entries. Filters can be specified in the query
        string.
        """
        try:
            criterions = query.get_query_criterions_from_request(request)
            if not permissions.has_manager_permissions():
                user_service.check_criterions_has_task_related(criterions)
            return shots_service.get_episodes(criterions)
        except permissions.PermissionDenied:
            abort(403)


class EpisodeSequencesResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @jwt_required
    def get(self, episode_id):
        """
        Retrieve all sequence entries for a given episode.
        Filters can be specified in the query string.
        """
        try:
            episode = shots_service.get_episode(episode_id)
            if not permissions.has_manager_permissions():
                user_service.check_has_task_related(episode["project_id"])

            criterions = query.get_query_criterions_from_request(request)
            criterions["parent_id"] = episode_id
            return shots_service.get_sequences(criterions)
        except permissions.PermissionDenied:
            abort(403)


class SequenceResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @jwt_required
    def get(self, sequence_id):
        """
        Retrieve given sequence.
        """
        try:
            sequence = shots_service.get_sequence(sequence_id)
            if not permissions.has_manager_permissions():
                user_service.check_has_task_related(sequence["project_id"])
            return sequence
        except SequenceNotFoundException:
            abort(404)
        except permissions.PermissionDenied:
            abort(403)


class SequencesResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @jwt_required
    def get(self):
        """
        Retrieve all sequence entries. Filters can be specified in the query
        string.
        """
        try:
            criterions = query.get_query_criterions_from_request(request)
            if not permissions.has_manager_permissions():
                user_service.check_criterions_has_task_related(criterions)
            return shots_service.get_sequences(criterions)
        except permissions.PermissionDenied:
            abort(403)


class SequenceShotsResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @jwt_required
    def get(self, sequence_id):
        """
        Retrieve all shot entries for a given sequence.
        Filters can be specified in the query string.
        """
        try:
            sequence = shots_service.get_sequence(sequence_id)
            if not permissions.has_manager_permissions():
                user_service.check_has_task_related(sequence["project_id"])
            criterions = query.get_query_criterions_from_request(request)
            criterions["parent_id"] = sequence_id
        except permissions.PermissionDenied:
            abort(403)

        return shots_service.get_shots(criterions)


class CastingResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @jwt_required
    def get(self, shot_id):
        """
        Resource to retrieve the casting of a given shot.
        """
        try:
            shot = shots_service.get_shot(shot_id)
            if not permissions.has_manager_permissions():
                user_service.check_has_task_related(shot.project_id)
        except ShotNotFoundException:
            abort(404)
        except permissions.PermissionDenied:
            abort(403)

        return breakdown_service.get_casting(shot)

    @jwt_required
    def put(self, shot_id):
        """
        Resource to allow the modification of assets linked to a shot.
        """
        casting = request.json
        try:
            permissions.check_manager_permissions()
            return breakdown_service.update_casting(shot_id, casting)
        except ShotNotFoundException:
            abort(404)
        except permissions.PermissionDenied:
            abort(403)
