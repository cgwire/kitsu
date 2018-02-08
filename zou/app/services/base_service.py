from sqlalchemy.exc import StatementError


def get_instance(model, instance_id, exception):
    """
    Get instance of any model from its ID and raise given exception if not
    found.
    """
    try:
        instance = model.get(instance_id)
    except StatementError:
        raise exception()

    if instance is None:
        raise exception()

    return instance


def get_or_create_instance_by_name(model, **kwargs):
    """
    Get instance of any model by name. If it doesn't exist it creates a new
    instance of this model from positional arguments dict.
    """
    instance = model.get_by(name=kwargs["name"])
    if instance is None:
        instance = model.create(**kwargs)
    return instance.serialize()
