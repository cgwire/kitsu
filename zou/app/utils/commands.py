import json
import datetime

from zou.app.stores import auth_tokens_store
from zou.app.services import (
    assets_service,
    projects_service,
    shots_service,
    tasks_service
)


def clean_auth_tokens():
    """
    Remove all revoked tokens (most of the time outdated) from the key value
    store.
    """
    for key in auth_tokens_store.keys():
        value = json.loads(auth_tokens_store.get(key))

        is_revoked = value["revoked"] == True
        expiration = datetime.datetime.fromtimestamp(value["token"]["exp"])
        is_expired = expiration < datetime.datetime.now()

        if is_revoked or is_expired:
            auth_tokens_store.delete(key)


def delete_auth_tokens():
    """
    Remove all authentication tokens from the key value store.
    """
    for key in auth_tokens_store.keys():
        auth_tokens_store.delete(key)


def init_data():
    """
    Put the minimum required data into the database to start with it.
    """
    projects_service.get_open_status()
    projects_service.get_closed_status()
    print("Project status initialized.")

    assets_service.get_or_create_asset_type("Characters")
    assets_service.get_or_create_asset_type("Props")
    assets_service.get_or_create_asset_type("Environment")
    assets_service.get_or_create_asset_type("FX")
    assets_service.get_or_create_asset_type("Camera")
    print("Asset types initialized.")

    shots_service.get_episode_type()
    shots_service.get_sequence_type()
    shots_service.get_shot_type()
    print("Shot types initialized.")

    modeling = tasks_service.get_or_create_department("Modeling")
    animation = tasks_service.get_or_create_department("Animation")
    fx = tasks_service.get_or_create_department("FX")
    compositing = tasks_service.get_or_create_department("Compositing")
    concept = tasks_service.get_or_create_department("Concept")
    layout = tasks_service.get_or_create_department("Layout")

    tasks_service.get_or_create_task_type(
        concept, "Concept", "#8D6E63", 1)
    tasks_service.get_or_create_task_type(
        modeling, "Texture", "#64B5F6", 2)
    tasks_service.get_or_create_task_type(
        modeling, "Modeling", "#78909C", 3)
    tasks_service.get_or_create_task_type(
        animation, "Setup", "#9CCC65", 4)

    tasks_service.get_or_create_task_type(
        concept, "Storyboard", "#43A047",
        priority=1, for_shots=True, for_entity="Shot")
    tasks_service.get_or_create_task_type(
        layout, "Layout", "#7CB342",
        priority=2, for_shots=True, for_entity="Shot")
    tasks_service.get_or_create_task_type(
        animation, "Animation", "#009688",
        priority=3, for_shots=True, for_entity="Shot")
    tasks_service.get_or_create_task_type(
        compositing, "Lighting", "#F9A825",
        priority=4, for_shots=True, for_entity="Shot")
    tasks_service.get_or_create_task_type(
        fx, "FX", "#26C6DA",
        priority=5, for_shots=True, for_entity="Shot")
    tasks_service.get_or_create_task_type(
        compositing, "Render", "#F06292",
        priority=6, for_shots=True, for_entity="Shot")
    tasks_service.get_or_create_task_type(
        compositing, "Compositing", "#ff5252",
        priority=7, for_shots=True, for_entity="Shot")
    print("Task types initialized.")

    tasks_service.get_or_create_status(
        "Todo",
        "todo",
        "#f5f5f5"
    )
    tasks_service.get_or_create_status(
        "Work In Progress",
        "wip",
        "#3273dc"
    )
    tasks_service.get_or_create_status(
        "Waiting For Approval",
        "wfa",
        "#ab26ff",
        is_reviewable=True
    )
    tasks_service.get_or_create_status(
        "Retake",
        "retake",
        "#ff3860",
        is_reviewable=True
    )
    tasks_service.get_or_create_status(
        "Done",
        "done",
        "#22d160",
        is_done=True
    )
    print("Task status initialized.")
