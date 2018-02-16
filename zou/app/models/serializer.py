from sqlalchemy.inspection import inspect
from zou.app.utils.fields import serialize_value


class SerializerMixin(object):
    """
    Helpers to facilitate JSON serialization of models.
    """

    def serialize(self, obj_type=None):
        attrs = inspect(self).attrs.keys()
        obj_dict = {
            attr: serialize_value(getattr(self, attr)) for attr in attrs
        }
        obj_dict["type"] = obj_type or type(self).__name__
        return obj_dict

    @staticmethod
    def serialize_list(models, obj_type=None):
        return [model.serialize(obj_type=obj_type) for model in models]
