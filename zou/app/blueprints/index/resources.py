from flask_restful import Resource
from zou import __version__

from zou.app import app


class IndexResource(Resource):
    def get(self):
        return {
            'api': app.config["APP_NAME"],
            'version': __version__
        }
