from flask_restful import Resource
from zou.app.utils import git


class IndexResource(Resource):
    def get(self):
        git_hash = git.get_git_revision_hash()
        return {
            'api': 'Unit Image Pipeline Server',
            'git_hash': git_hash.decode("utf-8")
        }
