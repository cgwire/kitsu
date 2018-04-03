#!/usr/bin/env python
import os
import sys
import flask_migrate

from zou.app.utils import dbhelpers, auth, commands
from zou.app.services import (
    assets_service,
    persons_service,
    projects_service,
    shots_service,
    tasks_service
)

import click


@click.group()
def cli():
    pass


@cli.command()
def init_db():
    "Creates datababase table (database must be created through PG client)."

    print("Creating database and tables...")
    dbhelpers.create_all()
    print("Database and tables created.")


@cli.command()
def clear_db():
    "Drop all tables from database"

    print("Deleting database and tables...")
    dbhelpers.drop_all()
    print("Database and tables deleted.")


@cli.command()
def reset_db():
    "Drop all tables then recreates them."

    clear_db()
    init_db()


@cli.command()
def upgrade_db():
    "Upgrade database schema."

    from zou.app import app
    with app.app_context():
        import zou
        directory = os.path.join(
            os.path.dirname(zou.__file__), "migrations"
        )
        flask_migrate.upgrade(directory=directory)


@cli.command()
@click.argument("email")
def create_admin(email):
    "Create an admin user to allow usage of the API when database is empty."
    "Set password is 'default'."

    try:
        auth.validate_email(email)
        password = auth.encrypt_password("default")
        persons_service.create_person(
            email,
            password,
            "Super",
            "Admin",
            role="admin"
        )
        print("Admin successfully created.")

    except auth.PasswordsNoMatchException:
        print("Passwords don't match.")
        sys.exit(1)
    except auth.PasswordTooShortException:
        print("Password is too short.")
        sys.exit(1)
    except auth.EmailNotValidException:
        print("Email is not valid.")
        sys.exit(1)


@cli.command('clean_auth_tokens')
def clean_auth_tokens():
    "Remove revoked and expired tokens."
    commands.clean_auth_tokens()


@cli.command('init_data')
def init_data():
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

    tasks_service.get_or_create_task_type(concept, "Concept", "#8D6E63", 1)
    tasks_service.get_or_create_task_type(modeling, "Texture", "#64B5F6", 2)
    tasks_service.get_or_create_task_type(modeling, "Modeling", "#78909C", 3)
    tasks_service.get_or_create_task_type(animation, "Setup", "#9CCC65", 4)
    tasks_service.get_or_create_task_type(concept, "Storyboard", "#43A047", 1, True)
    tasks_service.get_or_create_task_type(layout, "Layout", "#7CB342", 2, True)
    tasks_service.get_or_create_task_type(
        animation, "Animation", "#009688", 3, True)
    tasks_service.get_or_create_task_type(
        compositing, "Lighting", "#F9A825", 4, True)
    tasks_service.get_or_create_task_type(fx, "FX", "#26C6DA", 5, True)
    tasks_service.get_or_create_task_type(compositing, "Render", "#F06292", 6, True)
    tasks_service.get_or_create_task_type(
        compositing, "Compositing", "#ff5252", 7, True)
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


@cli.command()
def patch_set_done_flag_on_task_status():
    """
    Patch to run after upgrade from 0.4.8 or lower to 0.4.9 or superior.
    """
    for task_status in tasks_service.get_task_statuses():
        tasks_service.update_task_status(task_status["id"], {
            "is_done": task_status["short_name"] == "done"
        })


if __name__ == '__main__':
    cli()
