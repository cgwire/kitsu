from flask import request, abort
from flask_restful import Resource
from flask_jwt_extended import jwt_required

from sqlalchemy.exc import StatementError

from zou.app.models.data_import_error import DataImportError


class ShotgunImportErrorsResource(Resource):
    def __init__(self):
        Resource.__init__(self)

    @jwt_required
    def get(self):
        criterions = {"source": "shotgun"}
        import_errors = DataImportError.query.filter_by(**criterions).all()
        return DataImportError.serialize_list(import_errors)

    @jwt_required
    def post(self):
        error = DataImportError(event_data=request.json, source="shotgun")
        error.save()
        return error.serialize(), 201


class ShotgunImportErrorResource(Resource):
    def __init__(self):
        Resource.__init__(self)

    @jwt_required
    def delete(self, error_id):
        try:
            error = DataImportError.get(error_id)
        except StatementError:
            abort(404)

        if error is None:
            abort(404)
        error.delete()

        return {"deletion_success": True}, 204
