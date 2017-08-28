from flask_restful import Api, output_json


def configure_api_from_blueprint(blueprint, route_tuples):
    api = Api(blueprint, catch_all_404s=True)

    api.representations = {
        'application/json; charset=utf-8': output_json,
        'application/json': output_json,
    }

    for route_tuple in route_tuples:
        (path, resource) = route_tuple
        api.add_resource(resource, path)

    return api
