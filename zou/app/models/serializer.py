from sqlalchemy.inspection import inspect
from zou.app.utils.fields import serialize_value


class SerializerMixin(object):

    def serialize(self):
        attrs = inspect(self).attrs.keys()
        return {
            attr: serialize_value(getattr(self, attr)) for attr in attrs
        }

    @staticmethod
    def serialize_list(models):
        return [model.serialize() for model in models]
