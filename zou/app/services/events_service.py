from zou.app.models.event import ApiEvent
from zou.app.utils import fields


def get_last_events():
    """
    Return last 100 events published.
    """
    events = ApiEvent.query \
        .order_by(ApiEvent.created_at.desc()) \
        .limit(100) \
        .all()
    return fields.serialize_list(events)
