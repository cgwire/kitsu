from flask_restful import Api, output_json


def configure_api_from_blueprint(blueprint, route_tuples):
    """
    Creates a Flask Restful api object based on information from given
    blueprint. API is configured to return JSON objects.

    Each blueprint is describe by a list of tuple. Each tuple is composed of a
    route and the related resource (controller).
    """

    api = Api(blueprint, catch_all_404s=True)

    api.representations = {
        "application/json; charset=utf-8": output_json,
        "application/json": output_json,
    }

    for route_tuple in route_tuples:
        (path, resource) = route_tuple
        api.add_resource(resource, path)

    return api
