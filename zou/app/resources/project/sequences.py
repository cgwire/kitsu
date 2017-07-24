from flask import request
from flask_restful import Resource
from flask_login import login_required

from zou.app.utils import query
from zou.app.project import shot_info
from zou.app.models.entity import Entity


class SequencesResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @login_required
    def get(self):
        """
        Retrieve all sequence entries. Filters can be specified in the query
        string.
        """
        criterions = query.get_query_criterions_from_request(request)
        sequences = shot_info.get_sequences(criterions)
        return Entity.serialize_list(sequences)


class SequenceShotsResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @login_required
    def get(self, instance_id):
        """
        Retrieve all shot entries for a given sequence.
        Filters can be specified in the query string.
        """
        criterions = query.get_query_criterions_from_request(request)
        criterions["parent_id"] = instance_id
        return shot_info.get_shots(criterions)
