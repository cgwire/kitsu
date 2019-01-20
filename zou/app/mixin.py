from flask_restful import reqparse


class ArgsMixin(object):
    def get_args(self, descriptors):
        parser = reqparse.RequestParser()
        for descriptor in descriptors:
            action = None

            if len(descriptor) == 4:
                (name, default, required, action) = descriptor
            else:
                (name, default, required) = descriptor

            parser.add_argument(
                name,
                required=required,
                default=default,
                action=action
            )

        return parser.parse_args()
