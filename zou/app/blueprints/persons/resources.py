from flask import request
from flask_restful import Resource
from flask_jwt_extended import jwt_required

from zou.app.services import persons_service
from zou.app.utils import auth


class NewPersonResource(Resource):

    @jwt_required
    def post(self):
        data = request.json
        person = persons_service.create_person(
            data["email"],
            auth.encrypt_password("default"),
            data["first_name"],
            data["last_name"],
            data["phone"]
        )

        return person.serialize(), 201
