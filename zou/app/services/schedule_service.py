from datetime import date, timedelta

from zou.app.models.schedule_item import ScheduleItem
from zou.app.services import (
    base_service,
    tasks_service
)


def get_schedule_items(project_id):
    """
    Return all schedule items for given project. If no schedule item exists
    for a given task type, it creates one.
    """
    task_types = tasks_service.get_task_types_for_project(project_id)
    task_type_map = base_service.get_model_map_from_array(task_types)
    schedule_items = set(
        ScheduleItem.query
            .filter_by(project_id=project_id)
            .all()
    )
    schedule_item_map = {
        str(schedule_item.task_type_id): schedule_item
        for schedule_item in schedule_items
    }

    new_schedule_items = set()
    schedule_item_to_remove = set()
    for schedule_item in schedule_items:
        if schedule_item.task_type_id is not None:
            if str(schedule_item.task_type_id) not in task_type_map:
                schedule_item_to_remove.add(schedule_item)

    for task_type in task_types:
        if task_type["id"] not in schedule_item_map:
            new_schedule_item = ScheduleItem.create(
                project_id=project_id,
                start_date=date.today(),
                end_date=date.today() + timedelta(days=1),
                task_type_id=task_type["id"]
            )
            new_schedule_items.add(new_schedule_item)

    schedule_items = \
        schedule_items.union(new_schedule_items) - schedule_item_to_remove
    return sorted([
        schedule_item.present() for schedule_item in schedule_items
    ], key=lambda x: x["start_date"])
