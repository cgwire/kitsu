from zou.app.models.comment import Comment
from zou.app.models.entity import Entity
from zou.app.models.entity_type import EntityType
from zou.app.models.notifications import Notification

from zou.app.services import tasks_service, persons_service, shots_service


def get_full_entity_name(entity_id):
    """
    Get full entity name whether it's an asset or a shot. If it's a shot
    the result is "Episode name / Sequence name / Shot name". If it's an
    asset the result is "Asset type name / Asset name".
    """
    entity = Entity.get(entity_id)
    if shots_service.is_shot(entity.serialize()):
        sequence = Entity.get(entity.parent_id)
        if sequence.parent_id is None:
            return "%s / %s" % (sequence.name, entity.name)
        else:
            episode = Entity.get(sequence.parent_id)
            return "%s / %s / %s" % (
                episode.name,
                sequence.name,
                entity.name
            )
    else:
        asset_type = EntityType.get(entity.entity_type_id)
        name = "%s / %s" % (asset_type.name, entity.name)
    return name


def create_notification(person, comment, read=False, change=False):
    """
    Create a new notification for given person and comment.
    """
    notification = Notification.create(
        read=read,
        change=change,
        person_id=person["id"],
        author_id=comment["person_id"],
        comment_id=comment["id"],
        task_id=comment["object_id"]

    )
    return notification.serialize()


def get_notification_recipients(task):
    """
    Get the list of notification recipients for given task: assignees and
    every people who commented the task.
    """
    recipients = set()
    comments = Comment.get_all_by(object_id=task["id"])

    for assignee_id in task["assignees"]:
        recipients.add(assignee_id)

    for comment in comments:
        recipients.add(str(comment.person_id))

    return recipients


def create_notifications_for_task_and_comment(task, comment, change=False):
    """
    For given task and comment, create a notification for every assignee
    to the task and to every person participating to this task.
    """
    task = tasks_service.get_task(task["id"])
    recipient_ids = get_notification_recipients(task)
    recipient_ids.remove(comment["person_id"])

    for recipient_id in recipient_ids:
        person = persons_service.get_person(recipient_id)
        create_notification(
            person, comment, read=False, change=change
        )
    return recipient_ids
