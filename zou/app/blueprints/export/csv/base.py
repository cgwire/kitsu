from flask_jwt_extended import jwt_required

from zou.app.blueprints.crud.base import BaseModelResource
from zou.app.utils import csv_utils


class BaseCsvExport(BaseModelResource):

    def __init__(self, model):
        BaseModelResource.__init__(self, model)

    @jwt_required
    def get(self):
        csv_content = []
        csv_content.append(self.build_headers())
        results = self.build_query().all()
        for result in results:
            csv_content.append(self.build_row(result))

        return csv_utils.build_csv_response(csv_content)
