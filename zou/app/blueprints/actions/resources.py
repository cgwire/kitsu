import requests

from flask import request
from flask_restful import Resource
from flask_jwt_extended import jwt_required

from zou.app.services import actions_service
from zou.app.utils import permissions


class RunActionResource(Resource):

    @jwt_required
    def post(self, action_id):
        action = actions_service.get_action(action_id)
        permissions.check_manager_permissions()
        data = request.json
        requests.post(action["url"], json=data)

        return {"success": True}, 200
