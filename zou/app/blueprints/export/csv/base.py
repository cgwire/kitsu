from flask import abort
from flask_jwt_extended import jwt_required

from zou.app.blueprints.crud.base import BaseModelResource
from zou.app.utils import csv_utils, permissions


class BaseCsvExport(BaseModelResource):

    def __init__(self, model):
        BaseModelResource.__init__(self, model)
        self.file_name = "export"

    def check_permissions(self):
        pass

    @jwt_required
    def get(self):
        try:
            self.check_permissions()
            csv_content = []
            csv_content.append(self.build_headers())
            results = self.build_query().all()
            for result in results:
                csv_content.append(self.build_row(result))
        except permissions.PermissionDenied:
            abort(403)

        return csv_utils.build_csv_response(
            csv_content,
            file_name=self.file_name
        )
