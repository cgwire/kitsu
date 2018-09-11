from flask import request
from flask_restful import Resource, current_app
from flask_jwt_extended import jwt_required

from zou.app.utils import fields, permissions
from zou.app.blueprints.source.shotgun.exception import (
    ShotgunEntryImportFailed
)

from zou.app.services import (
    assets_service,
    shots_service,
    tasks_service
)

from zou.app.services.exception import (
    AssetNotFoundException,
    EpisodeNotFoundException,
    SceneNotFoundException,
    SequenceNotFoundException,
    ShotNotFoundException,
    TaskNotFoundException
)

from sqlalchemy.exc import IntegrityError, DataError


class BaseImportShotgunResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @jwt_required
    def post(self):
        results = []
        self.sg_entries = request.json

        self.check_permissions()
        self.prepare_import()

        for sg_entry in self.filtered_entries():
            try:
                data = self.extract_data(sg_entry)
                result_entry = self.import_entry(data)
                results.append(result_entry)
            except ShotgunEntryImportFailed as exception:
                current_app.logger.warn(exception)
            except KeyError as exception:
                current_app.logger.warn(exception)
                current_app.logger.error(
                    "Your data is not properly formatted: %s" % sg_entry
                )
            except IntegrityError as exception:
                current_app.logger.error(exception)
                current_app.logger.error(
                    "Data information are duplicated or wrong: %s" %
                    sg_entry
                )
                raise
            except DataError as exception:
                current_app.logger.error(exception)
                current_app.logger.error(
                    "Data cannot be stored (schema error)" %
                    sg_entry
                )
                raise

        self.post_processing()

        return fields.serialize_models(results), 200

    def filtered_entries(self):
        return self.sg_entries

    def check_permissions(self):
        return permissions.check_admin_permissions()

    def prepare_import(self):
        pass

    def extract_data(self, sg_entry):
        pass

    def import_entry(self, data):
        pass

    def post_processing(self):
        pass

    def get_instance_id(self, get_by_sg_id_func, sg_id, exception):
        try:
            return get_by_sg_id_func(sg_id)["id"]
        except exception:
            return None

    def get_task_id(self, task_sg_id):
        return self.get_instance_id(
            tasks_service.get_task_by_shotgun_id,
            task_sg_id,
            TaskNotFoundException
        )

    def get_asset_id(self, asset_sg_id):
        return self.get_instance_id(
            assets_service.get_asset_by_shotgun_id,
            asset_sg_id,
            AssetNotFoundException
        )

    def get_shot_id(self, shot_sg_id):
        return self.get_instance_id(
            shots_service.get_shot_by_shotgun_id,
            shot_sg_id,
            ShotNotFoundException
        )

    def get_scene_id(self, scene_sg_id):
        return self.get_instance_id(
            shots_service.get_scene_by_shotgun_id,
            scene_sg_id,
            SceneNotFoundException
        )

    def get_sequence_id(self, sequence_sg_id):
        return self.get_instance_id(
            shots_service.get_sequence_by_shotgun_id,
            sequence_sg_id,
            SequenceNotFoundException
        )

    def get_episode_id(self, episode_sg_id):
        return self.get_instance_id(
            shots_service.get_episode_by_shotgun_id,
            episode_sg_id,
            EpisodeNotFoundException
        )

    def extract_custom_data(self, sg_shot):
        return {
            k: v for k, v in sg_shot.items()
            if self.is_custom_field(k) and v is not None
        }

    def is_custom_field(self, name):
        return name[:3] == "sg_"


class ImportRemoveShotgunBaseResource(Resource):

    def __init__(self, model, delete_func=None, entity_type_id=None):
        Resource.__init__(self)
        self.model = model
        self.delete_func = delete_func
        self.entity_type_id = entity_type_id

    @jwt_required
    def post(self):
        sg_model = request.json
        instance = self.get_instance(sg_model)

        if instance is not None:
            result = {
                "removed_instance_id": str(instance.id),
                "success": self.delete_instance(instance)
            }
        else:
            result = {"success": True}

        return result

    def get_instance(self, sg_model):
        if self.entity_type_id is not None:
            instance = self.model.get_by(
                shotgun_id=sg_model["id"],
                entity_type_id=self.entity_type_id
            )
        else:
            instance = self.model.get_by(shotgun_id=sg_model["id"])
        return instance

    def delete_instance(self, instance):
        is_success = True
        try:
            if self.delete_func is not None:
                self.delete_func(instance)
            else:
                instance.delete()
        except IntegrityError as exception:
            sg_id = instance.shotgun_id
            current_app.logger.error(str(exception))
            current_app.logger.error(
                "An error occured while deleting model %s." % sg_id
            )
            is_success = False
        return is_success
