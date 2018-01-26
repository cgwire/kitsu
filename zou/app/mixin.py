from flask_restful import reqparse


class ArgsMixin(object):
    def get_args(self, descriptors):
        parser = reqparse.RequestParser()
        for (name, default, required) in descriptors:
            if required is None:
                required = False
            parser.add_argument(name, required=required, default=default)

        return parser.parse_args()
