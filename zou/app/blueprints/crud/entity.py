import copy

from flask import current_app
from flask_jwt_extended import jwt_required

from sqlalchemy.exc import IntegrityError, StatementError

from zou.app.models.entity import Entity
from zou.app.services import user_service

from .base import BaseModelResource, BaseModelsResource


class EntitiesResource(BaseModelsResource):

    def __init__(self):
        BaseModelsResource.__init__(self, Entity)


class EntityResource(BaseModelResource):

    def __init__(self):
        BaseModelResource.__init__(self, Entity)

    def check_read_permissions(self, entity):
        user_service.check_project_access(entity["project_id"])

    @jwt_required
    def put(self, instance_id):
        """
        Update a model with data given in the request body. JSON format is
        expected. Model performs the validation automatically when fields are
        modified.
        """
        try:
            data = self.get_arguments()
            entity = self.get_model_or_404(instance_id)
            self.check_update_permissions(entity.serialize(), data)

            extra_data = copy.copy(entity.data) or {}
            if "data" not in data or data["data"] is None:
                data["data"] = {}
            extra_data.update(data["data"])
            data["data"] = extra_data

            entity.update(data)
            return entity.serialize(), 200

        except StatementError:
            return {"error": "Wrong id format"}, 400
        except TypeError as exception:
            current_app.logger.error(str(exception))
            return {"error": str(exception)}, 400
        except IntegrityError as exception:
            current_app.logger.error(str(exception))
            return {"error": str(exception)}, 400
        except StatementError as exception:
            current_app.logger.error(str(exception))
            return {"error": str(exception)}, 400
