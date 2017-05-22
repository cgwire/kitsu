from flask import request
from flask_restful import Resource
from flask_login import login_required

from zou.app.utils import query
from zou.app.project import shot_info
from zou.app.models.entity import Entity


class EpisodesResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @login_required
    def get(self):
        """
        Retrieve all episode entries. Filters can be specified in the query
        string.
        """
        criterions = query.get_query_criterions_from_request(request)
        sequences = shot_info.get_sequences(criterions)
        return Entity.serialize_list(sequences)


class EpisodeSequencesResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @login_required
    def get(self, instance_id):
        """
        Retrieve all sequence entries for a given episode.
        Filters can be specified in the query string.
        """
        criterions = query.get_query_criterions_from_request(request)
        criterions["parent_id"] = instance_id
        sequences = shot_info.get_sequences(criterions)
        return Entity.serialize_list(sequences)
