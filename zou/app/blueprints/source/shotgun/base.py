from flask import request, abort
from flask_restful import Resource, current_app
from flask_jwt_extended import jwt_required

from zou.app.utils import fields, permissions
from zou.app.blueprints.source.shotgun.exception import (
    ShotgunEntryImportFailed
)

from sqlalchemy.exc import IntegrityError


class BaseImportShotgunResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @jwt_required
    def post(self):
        results = []
        self.sg_entries = request.json

        try:
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
                except IntegrityError:
                    current_app.logger.error(
                        "Data information are duplicated or wrong: %s" %
                        sg_entry
                    )

                self.post_processing()
        except permissions.PermissionDenied:
            abort(403)

        return fields.serialize_models(results), 200

    def filtered_entries(self):
        return self.sg_entries

    def check_permissions(self):
        return permissions.check_manager_permissions()

    def prepare_import(self):
        pass

    def extract_data(self, sg_entry):
        pass

    def import_entry(self, data):
        pass

    def post_processing(self):
        pass


class ImportRemoveShotgunBaseResource(Resource):

    def __init__(self, model, delete_func=None, entity_type_id=None):
        Resource.__init__(self)
        self.model = model
        self.delete_func = delete_func
        self.entity_type_id = entity_type_id

    @jwt_required
    def post(self):
        sg_model = request.json
        if self.entity_type_id is not None:
            instance = self.model.get_by(
                shotgun_id=sg_model["id"],
                entity_type_id=self.entity_type_id
            )
        else:
            instance = self.model.get_by(shotgun_id=sg_model["id"])

        result = {"success": True}

        if instance is not None:
            result["removed_instance_id"] = str(instance.id)
            try:
                if self.delete_func is not None:
                    self.delete_func(instance)
                else:
                    instance.delete()
            except IntegrityError as exception:
                current_app.logger.error(str(exception))
                current_app.logger.error(
                    "An error occured while deleting model %s." % sg_model["id"]
                )
                result = {"success": False}

        return result
