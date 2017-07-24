try:
    from StringIO import StringIO
except ImportError:
    from io import StringIO
import csv

from zou.app import config
from flask import make_response
from slugify import slugify


def build_csv_response(csv_content, file_name="export"):
    file_name = build_csv_file_name(file_name)
    response_body = build_csv_string(csv_content)
    csv_response = make_response(response_body)
    csv_response = build_csv_headers(csv_response, file_name)

    return csv_response


def build_csv_file_name(file_name):
    return "%s_%s" % (
        slugify(config.APP_NAME, separator="_"),
        slugify(file_name, separator="_")
    )


def build_csv_string(csv_content):
    string_wrapper = StringIO()
    csv_writer = csv.writer(string_wrapper)
    csv_writer.writerows(csv_content)
    return string_wrapper.getvalue()


def build_csv_headers(csv_response, file_name):
    csv_response.headers["Content-Disposition"] = \
        "attachment; filename=%s.csv" % file_name
    csv_response.headers["Content-type"] = "text/csv"
    return csv_response
