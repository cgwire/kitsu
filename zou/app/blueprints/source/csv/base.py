import uuid
import os
import csv

from flask import request
from flask_restful import Resource
from flask_jwt_extended import jwt_required

from zou.app import app
from zou.app.utils import fields, permissions


class BaseCsvImportResource(Resource):

    def __init__(self):
        Resource.__init__(self)

    @jwt_required
    def post(self):
        uploaded_file = request.files["file"]
        file_name = "%s.csv" % uuid.uuid4()

        file_path = os.path.join(app.config["TMP_DIR"], file_name)
        uploaded_file.save(file_path)
        result = []

        try:
            self.check_permissions()
            self.prepare_import()
            with open(file_path) as csvfile:
                reader = csv.DictReader(csvfile)
                for row in reader:
                    result.append(self.import_row(row))

            return fields.serialize_models(result), 201
        except KeyError as e:
            return {"error": "A column is missing: %s" % e}, 400

    def prepare_import(self):
        pass

    def check_permissions(self):
        return permissions.check_manager_permissions()

    def import_row(self):
        pass

    def add_to_cache_if_absent(self, cache, retrieve_function, name):
        if name not in cache:
            cache[name] = retrieve_function(name)
        return cache[name]

    def get_id_from_cache(self, cache, name):
        cached_object = cache[name]
        if type(cached_object) is dict:
            return cached_object["id"]
        else:
            return cached_object.id


class BaseCsvProjectImportResource(BaseCsvImportResource):

    @jwt_required
    def post(self, project_id):
        uploaded_file = request.files["file"]
        file_name = "%s.csv" % uuid.uuid4()
        file_path = os.path.join(app.config["TMP_DIR"], file_name)
        uploaded_file.save(file_path)
        result = []

        try:
            self.check_permissions()
            self.prepare_import()
            with open(file_path) as csvfile:
                reader = csv.DictReader(csvfile)
                for row in reader:
                    result.append(self.import_row(row, project_id))

            return fields.serialize_models(result), 201
        except KeyError as e:
            print(e)
            return {"error": "A column is missing: %s" % e}, 400

    def import_row(self, project_id):
        pass
