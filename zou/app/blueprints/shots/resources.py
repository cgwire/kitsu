from flask import request, abort
from flask_restful import Resource, reqparse
from flask_jwt_extended import jwt_required

from zou.app.services import (
    breakdown_service,
    projects_service,
    playlists_service,
    scenes_service,
    shots_service,
    tasks_service,
    user_service
)

from zou.app.mixin import ArgsMixin
from zou.app.utils import query, permissions

from zou.app.services.exception import (
    ShotNotFoundException,
    WrongIdFormatException
)


class ShotResource(Resource):

    @jwt_required
    def get(self, shot_id):
        """
        Retrieve given shot.
        """
        shot = shots_service.get_full_shot(shot_id)
        user_service.check_project_access(shot["project_id"])
        return shot

    @jwt_required
    def delete(self, shot_id):
        """
        Delete given shot.
        """
        try:
            parser = reqparse.RequestParser()
            parser.add_argument("force", default=False, type=bool)
            args = parser.parse_args()
            force = args["force"]

            shot = shots_service.get_shot(shot_id)
            user_service.check_manager_project_access(shot["project_id"])

            deleted_shot = shots_service.remove_shot(shot_id, force=force)
        except ShotNotFoundException:
            abort(404)
        except permissions.PermissionDenied:
            abort(403)

        return '', 204


class SceneResource(Resource):

    @jwt_required
    def get(self, scene_id):
        """
        Retrieve given scene.
        """
        scene = shots_service.get_full_scene(scene_id)
        user_service.check_project_access(scene["project_id"])
        return scene

    @jwt_required
    def delete(self, scene_id):
        """
        Delete given scene.
        """
        scene = shots_service.get_scene(scene_id)
        user_service.check_manager_project_access(scene["project_id"])
        deleted_scene = shots_service.remove_scene(scene_id)
        return '', 204


class ShotsResource(Resource):

    @jwt_required
    def get(self):
        """
        Retrieve all shot entries. Filters can be specified in the query string.
        """
        criterions = query.get_query_criterions_from_request(request)
        if "sequence_id" in criterions:
            sequence = shots_service.get_sequence(criterions["sequence_id"])
            criterions["project_id"] = sequence["project_id"]
            criterions["parent_id"] = sequence["id"]
            del criterions["sequence_id"]
        user_service.check_project_access(criterions.get("project_id", None))
        return shots_service.get_shots(criterions)


class ScenesResource(Resource):

    @jwt_required
    def get(self):
        """
        Retrieve all scene entries. Filters can be specified in the query
        string.
        """
        criterions = query.get_query_criterions_from_request(request)
        user_service.check_project_access(criterions.get("project_id", None))
        return shots_service.get_scenes(criterions)


class ShotAssetsResource(Resource):

    @jwt_required
    def get(self, shot_id):
        """
        Retrieve all assets for a given shot.
        """
        shot = shots_service.get_shot(shot_id)
        user_service.check_project_access(shot["project_id"])
        return shots_service.get_entities_out(shot_id)


class ShotTaskTypesResource(Resource):

    @jwt_required
    def get(self, shot_id):
        """
        Retrieve all task types related to a given shot.
        """
        shot = shots_service.get_shot(shot_id)
        user_service.check_project_access(shot["project_id"])
        return tasks_service.get_task_types_for_shot(shot_id)


class ShotTasksResource(Resource):

    @jwt_required
    def get(self, shot_id):
        """
        Retrieve all tasks related to a given shot.
        """
        shot = shots_service.get_shot(shot_id)
        user_service.check_project_access(shot["project_id"])
        return tasks_service.get_tasks_for_shot(shot_id)


class ShotPreviewsResource(Resource):

    @jwt_required
    def get(self, shot_id):
        """
        Retrieve all previews related to a given shot. It sends them
        as a dict. Keys are related task type ids and values are arrays
        of preview for this task type.
        """
        shot = shots_service.get_shot(shot_id)
        user_service.check_project_access(shot["project_id"])
        return playlists_service.get_preview_files_for_shot(shot_id)


class SequenceTasksResource(Resource):

    @jwt_required
    def get(self, sequence_id):
        """
        Retrieve all tasks related to a given shot.
        """
        sequence = shots_service.get_sequence(sequence_id)
        user_service.check_project_access(sequence["project_id"])
        return tasks_service.get_tasks_for_sequence(sequence_id)


class SequenceTaskTypesResource(Resource):

    @jwt_required
    def get(self, sequence_id):
        """
        Retrieve all task types related to a given shot.
        """
        sequence = shots_service.get_sequence(sequence_id)
        user_service.check_project_access(sequence["project_id"])
        return tasks_service.get_task_types_for_sequence(sequence_id)


class ShotsAndTasksResource(Resource):

    @jwt_required
    def get(self):
        """
        Retrieve all shots, adds project name and asset type name and all
        related tasks.
        """
        criterions = query.get_query_criterions_from_request(request)
        user_service.check_project_access(criterions.get("project_id", None))
        return shots_service.get_shots_and_tasks(criterions)


class ProjectShotsResource(Resource):

    @jwt_required
    def get(self, project_id):
        """
        Retrieve all shots related to a given project.
        """
        projects_service.get_project(project_id)
        user_service.check_project_access(project_id)
        return shots_service.get_shots_for_project(project_id)

    @jwt_required
    def post(self, project_id):
        """
        Create a shot for given project.
        """
        (sequence_id, name, data) = self.get_arguments()
        projects_service.get_project(project_id)
        user_service.check_manager_project_access(project_id)

        shot = shots_service.create_shot(
            project_id,
            sequence_id,
            name,
            data=data
        )
        return shot, 201

    def get_arguments(self):
        parser = reqparse.RequestParser()
        parser.add_argument("name", required=True)
        parser.add_argument("sequence_id", default=None)

        parser.add_argument("data", type=dict)
        args = parser.parse_args()
        return (args["sequence_id"], args["name"], args["data"])


class ProjectSequencesResource(Resource):

    @jwt_required
    def get(self, project_id):
        """
        Retrieve all sequences related to a given project.
        """
        projects_service.get_project(project_id)
        user_service.check_project_access(project_id)
        return shots_service.get_sequences_for_project(project_id)

    @jwt_required
    def post(self, project_id):
        """
        Create a sequence for given project.
        """
        (episode_id, name) = self.get_arguments()
        projects_service.get_project(project_id)
        user_service.check_manager_project_access(project_id)
        sequence = shots_service.create_sequence(
            project_id,
            episode_id,
            name
        )
        return sequence, 201

    def get_arguments(self):
        parser = reqparse.RequestParser()
        parser.add_argument("name", required=True)
        parser.add_argument("episode_id", default=None)
        args = parser.parse_args()
        return (args["episode_id"], args["name"])


class ProjectEpisodesResource(Resource):

    @jwt_required
    def get(self, project_id):
        """
        Retrieve all episodes related to a given project.
        """
        projects_service.get_project(project_id)
        user_service.check_project_access(project_id)
        return shots_service.get_episodes_for_project(project_id)

    @jwt_required
    def post(self, project_id):
        """
        Create an episode for given project.
        """
        name = self.get_arguments()
        projects_service.get_project(project_id)
        user_service.check_manager_project_access(project_id)
        return shots_service.create_episode(project_id, name), 201

    def get_arguments(self):
        parser = reqparse.RequestParser()
        parser.add_argument("name", required=True)
        args = parser.parse_args()
        return args["name"]


class ProjectEpisodeStatsResource(Resource):

    @jwt_required
    def get(self, project_id):
        """
        Retrieve number of tasks by status, task_types and episodes
        for given project.
        """
        projects_service.get_project(project_id)
        user_service.check_project_access(project_id)
        return shots_service.get_episode_stats_for_project(project_id)


class EpisodeResource(Resource):

    @jwt_required
    def get(self, episode_id):
        """
        Retrieve given episode.
        """
        episode = shots_service.get_full_episode(episode_id)
        user_service.check_project_access(episode["project_id"])
        return episode


class EpisodesResource(Resource):

    @jwt_required
    def get(self):
        """
        Retrieve all episode entries. Filters can be specified in the query
        string.
        """
        criterions = query.get_query_criterions_from_request(request)
        user_service.check_project_access(criterions.get("project_id", None))
        return shots_service.get_episodes(criterions)


class EpisodeSequencesResource(Resource):

    @jwt_required
    def get(self, episode_id):
        """
        Retrieve all sequence entries for a given episode.
        Filters can be specified in the query string.
        """
        episode = shots_service.get_episode(episode_id)
        user_service.check_project_access(episode["project_id"])
        criterions = query.get_query_criterions_from_request(request)
        criterions["parent_id"] = episode_id
        return shots_service.get_sequences(criterions)


class SequenceResource(Resource):

    @jwt_required
    def get(self, sequence_id):
        """
        Retrieve given sequence.
        """
        sequence = shots_service.get_full_sequence(sequence_id)
        user_service.check_project_access(sequence["project_id"])
        return sequence


class SequencesResource(Resource):

    @jwt_required
    def get(self):
        """
        Retrieve all sequence entries. Filters can be specified in the query
        string.
        """
        criterions = query.get_query_criterions_from_request(request)
        if "episode_id" in criterions:
            episode = shots_service.get_episode(criterions["episode_id"])
            criterions["project_id"] = episode["project_id"]
            criterions["parent_id"] = episode["id"]
            del criterions["episode_id"]
        user_service.check_project_access(criterions.get("project_id", None))
        return shots_service.get_sequences(criterions)


class SequenceShotsResource(Resource):

    @jwt_required
    def get(self, sequence_id):
        """
        Retrieve all shot entries for a given sequence.
        Filters can be specified in the query string.
        """
        sequence = shots_service.get_sequence(sequence_id)
        user_service.check_project_access(sequence["project_id"])
        criterions = query.get_query_criterions_from_request(request)
        criterions["parent_id"] = sequence_id
        return shots_service.get_shots(criterions)


class CastingResource(Resource):

    @jwt_required
    def get(self, shot_id):
        """
        Resource to retrieve the casting of a given shot.
        """
        shot = shots_service.get_shot(shot_id)
        user_service.check_project_access(shot["project_id"])
        return breakdown_service.get_casting(shot_id)

    @jwt_required
    def put(self, shot_id):
        """
        Resource to allow the modification of assets linked to a shot.
        """
        casting = request.json
        shot = shots_service.get_shot(shot_id)
        user_service.check_project_access(shot["project_id"])
        return breakdown_service.update_casting(shot_id, casting)


class ProjectScenesResource(Resource):

    @jwt_required
    def get(self, project_id):
        """
        Retrieve all shots related to a given project.
        """
        projects_service.get_project(project_id)
        user_service.check_project_access(project_id)
        return shots_service.get_scenes_for_project(project_id)

    @jwt_required
    def post(self, project_id):
        """
        Create a shot for given project.
        """
        (sequence_id, name) = self.get_arguments()
        projects_service.get_project(project_id)
        user_service.check_manager_project_access(project_id)
        scene = shots_service.create_scene(
            project_id,
            sequence_id,
            name
        )
        return scene, 201

    def get_arguments(self):
        parser = reqparse.RequestParser()
        parser.add_argument("name", required=True)
        parser.add_argument("sequence_id", default=None)
        args = parser.parse_args()
        return (args["sequence_id"], args["name"])


class SequenceScenesResource(Resource):

    @jwt_required
    def get(self, sequence_id):
        """
        Retrieve all scenes related to a given sequence.
        """
        sequence = shots_service.get_sequence(sequence_id)
        user_service.check_project_access(sequence["project_id"])
        return shots_service.get_scenes_for_sequence(sequence_id)


class SceneTaskTypesResource(Resource):

    @jwt_required
    def get(self, scene_id):
        """
        Retrieve all task types related to a given scene.
        """
        scene = shots_service.get_scene(scene_id)
        user_service.check_project_access(scene["project_id"])
        return tasks_service.get_task_types_for_scene(scene_id)


class SceneTasksResource(Resource):

    @jwt_required
    def get(self, scene_id):
        """
        Retrieve all tasks related to a given scene.
        """
        scene = shots_service.get_scene(scene_id)
        user_service.check_project_access(scene["project_id"])
        return tasks_service.get_tasks_for_scene(scene_id)


class ShotAssetInstancesResource(Resource, ArgsMixin):

    @jwt_required
    def get(self, shot_id):
        """
        Retrieve all asset instances linked to shot.
        """
        shot = shots_service.get_shot(shot_id)
        user_service.check_project_access(shot["project_id"])
        return breakdown_service.get_asset_instances_for_shot(shot_id)

    @jwt_required
    def post(self, shot_id):
        """
        Add an asset instance to given shot.
        """
        args = self.get_args([
            ("asset_instance_id", None, True)
        ])
        shot = shots_service.get_shot(shot_id)
        user_service.check_project_access(shot["project_id"])
        shot = breakdown_service.add_asset_instance_to_shot(
            shot_id,
            args["asset_instance_id"]
        )
        return shot, 201


class RemoveShotAssetInstanceResource(Resource, ArgsMixin):

    @jwt_required
    def delete(self, shot_id, asset_instance_id):
        """
        Remove an asset instance from given shot.
        """
        shot = shots_service.get_shot(shot_id)
        user_service.check_project_access(shot["project_id"])
        shot = breakdown_service.remove_asset_instance_for_shot(
            shot_id,
            asset_instance_id
        )
        return '', 204


class SceneAssetInstancesResource(Resource, ArgsMixin):

    @jwt_required
    def get(self, scene_id):
        """
        Retrieve all asset instances linked to scene.
        """
        scene = shots_service.get_scene(scene_id)
        user_service.check_project_access(scene["project_id"])
        return breakdown_service.get_asset_instances_for_scene(scene_id)

    @jwt_required
    def post(self, scene_id):
        """
        Create an asset instance on given scene.
        """
        args = self.get_args([
            ("asset_id", None, True),
            ("description", None, False)
        ])
        scene = shots_service.get_scene(scene_id)
        user_service.check_project_access(scene["project_id"])
        asset_instance = breakdown_service.add_asset_instance_to_scene(
            scene_id,
            args["asset_id"],
            args["description"]
        )
        return asset_instance, 201


class SceneCameraInstancesResource(Resource):

    @jwt_required
    def get(self, scene_id):
        """
        Retrieve all asset instances linked to scene.
        """
        scene = shots_service.get_scene(scene_id)
        user_service.check_project_access(scene["project_id"])
        return breakdown_service.get_camera_instances_for_scene(scene_id)


class SceneShotsResource(Resource, ArgsMixin):

    @jwt_required
    def get(self, scene_id):
        """
        Retrieve all shots that comes from given scene.
        """
        scene = shots_service.get_scene(scene_id)
        user_service.check_project_access(scene["project_id"])
        return scenes_service.get_shots_by_scene(scene_id)

    @jwt_required
    def post(self, scene_id):
        """
        Mark given scene as source of given shot.
        """
        args = self.get_args([
            ("shot_id", None, True)
        ])
        scene = shots_service.get_scene(scene_id)
        user_service.check_project_access(scene["project_id"])
        shot = shots_service.get_shot(args["shot_id"])
        return scenes_service.add_shot_to_scene(scene, shot), 201


class RemoveShotFromSceneResource(Resource):

    @jwt_required
    def delete(self, scene_id, shot_id):
        scene = shots_service.get_scene(scene_id)
        user_service.check_project_access(scene["project_id"])
        shot = shots_service.get_shot(shot_id)
        scenes_service.remove_shot_from_scene(scene, shot)
        return '', 204
