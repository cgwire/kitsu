from sqlalchemy.exc import StatementError

from zou.app.models.comment import Comment
from zou.app.models.project import Project
from zou.app.models.entity import Entity
from zou.app.models.entity_type import EntityType
from zou.app.models.notifications import Notification
from zou.app.models.subscription import Subscription
from zou.app.models.task_type import TaskType

from zou.app.services import (
    tasks_service,
    persons_service,
    shots_service
)
from zou.app.services.exception import (
    PersonNotFoundException
)
from zou.app.utils import events, fields


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
    task_subscriptions = get_task_subscriptions(task)
    sequence_subscriptions = get_sequence_subscriptions(task)

    for assignee_id in task["assignees"]:
        recipients.add(assignee_id)

    for comment in comments:
        recipients.add(str(comment.person_id))

    for subscription in task_subscriptions:
        recipients.add(str(subscription.person_id))

    for subscription in sequence_subscriptions:
        recipients.add(str(subscription.person_id))

    return recipients


def get_task_subscriptions(task):
    """
    Return all notification subscriptions related to given task.
    """
    return Subscription.get_all_by(task_id=task["id"])


def get_sequence_subscriptions(task):
    """
    Return all sequence subscriptions for given task. It returns something only
    if the task is related to a shot of which the sequence has a subscription.
    """
    sequence_subscriptions = []
    entity = Entity.get(task["entity_id"])
    if entity is not None and entity.parent_id is not None:
        sequence_subscriptions = Subscription.get_all_by(
            task_type_id=task["task_type_id"],
            entity_id=entity.parent_id
        )
    return sequence_subscriptions


def create_notifications_for_task_and_comment(task, comment, change=False):
    """
    For given task and comment, create a notification for every assignee
    to the task and to every person participating to this task.
    """
    task = tasks_service.get_task(task["id"])
    recipient_ids = get_notification_recipients(task)
    recipient_ids.remove(comment["person_id"])

    for recipient_id in recipient_ids:
        try:
            person = persons_service.get_person(recipient_id)
            notification = create_notification(
                person, comment, read=False, change=change
            )
            events.emit("notification:new", {
                "notification_id": notification["id"],
                "person_id": recipient_id
            })
        except PersonNotFoundException:
            pass
    return recipient_ids


def get_task_subscription_raw(person_id, task_id):
    """
    Return subscription matching given person and task.
    """
    try:
        subscription = Subscription.get_by(
            person_id=person_id,
            task_id=task_id
        )
        return subscription
    except StatementError:
        return None


def has_task_subscription(person_id, task_id):
    """
    Return true if a subscription exists for this person and this task.
    """
    subscription = get_task_subscription_raw(person_id, task_id)
    return subscription is not None


def subscribe_to_task(person_id, task_id):
    """
    Add a subscription entry for given person and task.
    """
    subscription = get_task_subscription_raw(person_id, task_id)
    if subscription is None:
        subscription = Subscription.create(
            person_id=person_id,
            task_id=task_id
        )
    return subscription.serialize()


def unsubscribe_from_task(person_id, task_id):
    """
    Remove subscription entry for given person and task.
    """
    subscription = get_task_subscription_raw(person_id, task_id)
    if subscription is not None:
        subscription.delete()
        return subscription.serialize()
    else:
        return {}


def get_sequence_subscription_raw(person_id, sequence_id, task_type_id):
    """
    Return subscription matching given person, sequence and task type.
    """
    try:
        subscription = Subscription.get_by(
            person_id=person_id,
            entity_id=sequence_id,
            task_type_id=task_type_id
        )
        return subscription
    except StatementError:
        return None


def has_sequence_subscription(person_id, sequence_id, task_type_id):
    """
    Return true if a subscription exists for this person, sequence and task
    type.
    """
    subscription = get_sequence_subscription_raw(
        person_id,
        sequence_id,
        task_type_id
    )
    return subscription is not None


def subscribe_to_sequence(person_id, sequence_id, task_type_id):
    """
    Add a subscription entry for given person, sequence and task type.
    """
    subscription = get_sequence_subscription_raw(
        person_id,
        sequence_id,
        task_type_id
    )
    if subscription is None:
        subscription = Subscription.create(
            person_id=person_id,
            entity_id=sequence_id,
            task_type_id=task_type_id
        )
    return subscription.serialize()


def unsubscribe_from_sequence(person_id, sequence_id, task_type_id):
    """
    Remove subscription entry for given person, sequence and task type.
    """
    subscription = get_sequence_subscription_raw(
        person_id,
        sequence_id,
        task_type_id
    )
    if subscription is not None:
        subscription.delete()
        return subscription.serialize()
    else:
        return {}


def get_all_sequence_subscriptions(person_id, project_id, task_type_id):
    """
    Return list of sequence ids for which given person has subscribed for
    given project and task type.
    """
    subscriptions = Subscription.query \
        .join(Entity) \
        .join(Project) \
        .filter(Project.id == project_id) \
        .filter(TaskType.id == task_type_id) \
        .all()
    print(subscriptions)

    return fields.serialize_value([
        subscription.entity_id for subscription in subscriptions
    ])


def delete_notifications_for_comment(comment_id):
    notifications = Notification.get_all_by(comment_id=comment_id)
    for notification in notifications:
        notification.delete()
    return fields.serialize_list(notifications)
