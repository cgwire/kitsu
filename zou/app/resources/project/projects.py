from flask_restful import Resource
from flask_login import login_required

from zou.app.project import project_info
from zou.app.utils import fields


class OpenProjectsResource(Resource):

    @login_required
    def get(self):
        return fields.serialize_models(project_info.open_projects())
