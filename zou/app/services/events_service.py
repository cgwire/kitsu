from zou.app.models.event import ApiEvent
from zou.app.utils import fields


def get_last_events(before=None, page_size=100):
    """
    Return last 100 events published. If before parameter is set, it returns
    last 100 events before this date.
    """
    query = ApiEvent.query \
        .order_by(ApiEvent.created_at.desc()) \
        .with_entities(
            ApiEvent.created_at,
            ApiEvent.name,
            ApiEvent.user_id,
            ApiEvent.data
        )

    if before is not None:
        query = query.filter(ApiEvent.created_at < before)

    events = query.limit(page_size).all()
    return [
        {
            "created_at": fields.serialize_value(created_at),
            "name": fields.serialize_value(name),
            "user_id": fields.serialize_value(user_id),
            "data": fields.serialize_value(data),
        }
        for (
            created_at,
            name,
            user_id,
            data
        ) in events
    ]
