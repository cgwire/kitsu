import copy

from flask import current_app
from flask_jwt_extended import jwt_required

from sqlalchemy.exc import IntegrityError, StatementError

from zou.app.models.entity import Entity
from zou.app.services import user_service

from werkzeug.exceptions import NotFound

from .base import BaseModelResource, BaseModelsResource


class EntitiesResource(BaseModelsResource):

    def __init__(self):
        BaseModelsResource.__init__(self, Entity)

    def check_create_permissions(self, entity):
        user_service.check_manager_project_access(entity["project_id"])


class EntityResource(BaseModelResource):

    def __init__(self):
        BaseModelResource.__init__(self, Entity)
        self.protected_fields += [
            "instance_casting",
            "project_id",
            "entities_in",
            "entities_out",
            "type",
            "shotgun_id"
        ]

    def check_read_permissions(self, entity):
        user_service.check_project_access(entity["project_id"])

    def check_update_permissions(self, entity, data):
        return user_service.check_manager_project_access(entity["project_id"])

    def check_delete_permissions(self, entity):
        return user_service.check_manager_project_access(entity["project_id"])

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

            data = self.update_data(data, instance_id)
            if data.get("source_id", None) == "null":
                data["source_id"] = None
            entity.update(data)
            return entity.serialize(), 200

        except StatementError as exception:
            current_app.logger.error(str(exception))
            return {"error": True, "message": str(exception)}, 400
        except TypeError as exception:
            current_app.logger.error(str(exception))
            return {"error": True, "message": str(exception)}, 400
        except IntegrityError as exception:
            current_app.logger.error(str(exception))
            return {"error": True, "message": str(exception)}, 400
        except StatementError as exception:
            current_app.logger.error(str(exception))
            return {"error": True, "message": str(exception)}, 400
        except NotFound as exception:
            return {"error": True, "message": str(exception)}, 404
        except Exception as exception:
            current_app.logger.error(str(exception))
            return {"error": True, "message": str(exception)}, 400
