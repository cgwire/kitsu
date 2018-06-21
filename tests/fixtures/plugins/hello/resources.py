from flask_restful import Resource
from flask_jwt_extended import jwt_required


class HelloResource(Resource):

    def get(self):
        return {"Hello": "world"}
