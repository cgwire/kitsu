from flask import request
from flask_restful import Resource, current_app
from flask_jwt_extended import jwt_required

from zou.app.utils import fields
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
        self.prepare_import()

        for sg_entry in self.filtered_entries():
            try:
                data = self.extract_data(sg_entry)
                result_entry = self.import_entry(data)
                results.append(result_entry)
            except ShotgunEntryImportFailed as exception:
                current_app.logger.warn(exception.message)
            except KeyError as exception:
                current_app.logger.warn(exception.message)
                current_app.logger.error(
                    "Your data is not properly formatted: %s" % sg_entry
                )
            except IntegrityError:
                current_app.logger.error(
                    "Data information are duplicated or wrong: %s" % sg_entry
                )

            self.post_processing()

        return fields.serialize_models(results), 200

    def filtered_entries(self):
        return self.sg_entries

    def prepare_import(self):
        pass

    def extract_data(self, sg_entry):
        pass

    def import_entry(self, data):
        pass

    def post_processing(self):
        pass


class ImportRemoveShotgunBaseResource(Resource):

    def __init__(self, model, delete_func=None):
        Resource.__init__(self)
        self.model = model
        self.delete_func = delete_func

    @jwt_required
    def post(self):
        sg_model = request.json
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
