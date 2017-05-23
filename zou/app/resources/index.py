from flask_restful import Resource
from zou import __version__


class IndexResource(Resource):
    def get(self):
        return {
            'api': 'Zou API',
            'version': __version__
        }
