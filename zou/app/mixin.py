from flask_restful import reqparse
from flask import request


class ArgsMixin(object):
    """
    Helpers to retrieve parameters from GET or POST queries.
    """

    def get_args(self, descriptors):
        parser = reqparse.RequestParser()
        for descriptor in descriptors:
            action = None

            if len(descriptor) == 4:
                (name, default, required, action) = descriptor
            else:
                (name, default, required) = descriptor

            parser.add_argument(
                name, required=required, default=default, action=action
            )

        return parser.parse_args()

    def get_page(self):
        """
        Returns page requested by the user.
        """
        options = request.args
        return int(options.get("page", "-1"))
