import datetime
import uuid
import sqlalchemy.orm as orm

from pytz import tzinfo
from babel import Locale
from ipaddress import IPv4Address
from sqlalchemy_utils.types.choice import Choice


def serialize_value(value):
    """
    Utility function to handle the normalizing of specific fields.
    The aim is to make the result JSON serializable
    """
    if isinstance(value, datetime.datetime):
        return value.replace(microsecond=0).isoformat()
    if isinstance(value, datetime.date):
        return value.isoformat()
    elif isinstance(value, uuid.UUID):
        return str(value)
    elif isinstance(value, dict):
        return serialize_dict(value)
    elif isinstance(value, orm.collections.InstrumentedList):
        return serialize_orm_arrays(value)
    elif isinstance(value, bytes):
        return value.decode("utf-8")
    elif isinstance(value, str):
        return value
    elif isinstance(value, int):
        return value
    elif isinstance(value, list):
        return serialize_list(value)
    elif isinstance(value, Locale):
        return str(value)
    elif isinstance(value, tzinfo.DstTzInfo):
        return str(value)
    elif isinstance(value, Choice):
        return value.code
    elif isinstance(value, IPv4Address):
        return str(value)
    elif value is None:
        return None
    elif isinstance(value, object):
        if hasattr(value, 'serialize'):
            return value.serialize()
        else:
            return value
    else:
        return value


def serialize_list(list_value):
    """
    Serialize a list of any kind of objects into data structures JSON
    serializable.
    """
    return [serialize_value(value) for value in list_value]


def serialize_dict(dict_value):
    """
    Serialize a dict of any kind of objects into data structures JSON
    serializable.
    """
    result = {}
    for key in dict_value.keys():
        result[key] = serialize_value(dict_value[key])

    return result


def serialize_orm_arrays(array_value):
    """
    Serialize a orm array into simple data structures (useful for json dumping).
    """
    result = []
    for val in array_value:
        result.append(serialize_value(val.id))
    return result


def serialize_models(models):
    """
    Serialize a list of models (useful for json dumping)
    """
    return [model.serialize() for model in models if model is not None]


def gen_uuid():
    """
    Generate a unique identifier (useful for json dumping).
    """
    return uuid.uuid4()


def get_date_object(date_string, date_format="%Y-%m-%d"):
    """
    Shortcut for date parsing (useful for json dumping).
    """
    return datetime.datetime.strptime(date_string, date_format)
