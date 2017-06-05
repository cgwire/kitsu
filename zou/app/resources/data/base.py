import math
import json
import sqlalchemy.orm as orm

from flask import request, abort
from flask_restful import Resource, current_app
from flask_login import login_required

from sqlalchemy.exc import IntegrityError, StatementError


class BaseModelsResource(Resource):

    def __init__(self, model):
        Resource.__init__(self)
        self.model = model

    @login_required
    def get(self):
        """
        Retrieve all entries for given model. Filters can be specified in the
        query string.
        """
        if not request.args:
            return self.model.serialize_list(self.model.query.all())
        else:
            criterions = {}
            manytomany = []
            in_criterions = []
            options = request.args
            page = int(options.get("page", "-1"))

            for key, value in options.items():
                if key != "page":
                    field_key = getattr(self.model, key)
                    expr = field_key.property

                    if isinstance(expr, orm.properties.RelationshipProperty):
                        manytomany.append((key, value))
                    elif len(value) > 0 and value[0] == '[':
                        in_criterions.append(
                            field_key.in_(json.loads(value))
                        )
                    else:
                        criterions[key] = value
            query = self.model.query.filter_by(**criterions)
            for in_criterion in in_criterions:
                query = query.filter(in_criterion)

            for (key, value) in manytomany:
                query = query.filter(getattr(self.model, key).any(id=value))

            if page == -1:
                return self.model.serialize_list(query.all())
            else:
                total = query.count()
                limit = current_app.config['NB_RECORDS_PER_PAGE']
                offset = (page - 1) * limit

                if (total < offset) or (page < 1):
                    abort(404)

                query = query.limit(limit)
                query = query.offset(offset)

                result = {
                    "data": self.model.serialize_list(query.all()),
                    "total": total,
                    "nb_pages": int(math.ceil(total / float(limit))),
                    "limit": limit,
                    "offset": offset,
                    "page": 2
                }
                return result

    @login_required
    def post(self):
        """
        Create a model with data given in the request body. JSON format is
        expected. The model performs the validation automatically when
        instantiated.
        """
        try:
            instance = self.model(**request.json)
            instance.save()
            return instance.serialize(), 201

        except TypeError as exception:
            current_app.logger.error(str(exception))
            return {"error": str(exception)}, 400

        except IntegrityError as exception:
            current_app.logger.error(str(exception))
            return {"error": str(exception)}, 400

        except StatementError as exception:
            current_app.logger.error(str(exception))
            return {"error": str(exception)}, 400


class BaseModelResource(Resource):

    def __init__(self, model):
        Resource.__init__(self)
        self.model = model

    def get_model_or_404(self, instance_id):
        instance = self.model.get(instance_id)
        if instance is None:
            abort(404)
        return instance

    @login_required
    def get(self, instance_id):
        """
        Retrieve a model corresponding at given ID and return it as a JSON
        object.
        """
        try:
            instance = self.get_model_or_404(instance_id)
        except StatementError:
            return {"error": "Wrong id format"}, 400
        return instance.serialize(), 200

    @login_required
    def put(self, instance_id):
        """
        Update a model with data given in the request body. JSON format is
        expected. Model performs the validation automatically when fields are
        modified.
        """
        try:
            instance = self.get_model_or_404(instance_id)
            instance.update(request.json)
            return instance.serialize(), 200

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


    @login_required
    def delete(self, instance_id):
        """
        Delete a model corresponding at given ID and return it as a JSON
        object.
        """
        instance = self.get_model_or_404(instance_id)
        instance.delete()
        return {"deletion_success": True}, 204
