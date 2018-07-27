#!/usr/bin/env python
import os
import sys
import flask_migrate
import click

from zou.app.utils import dbhelpers, auth, commands
from zou.app.services import (
    persons_service,
    tasks_service
)


@click.group()
def cli():
    pass


@cli.command()
def init_db():
    "Creates datababase table (database must be created through PG client)."

    print("Creating database and tables...")
    from zou.app import app
    with app.app_context():
        import zou
        directory = os.path.join(
            os.path.dirname(zou.__file__), "migrations"
        )
        flask_migrate.upgrade(directory=directory)
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
    dbhelpers.create_all()


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
def stamp_db():
    "Upgrade database schema."

    from zou.app import app
    with app.app_context():
        import zou
        directory = os.path.join(
            os.path.dirname(zou.__file__), "migrations"
        )
        flask_migrate.stamp(directory=directory)


@cli.command()
@click.argument("email")
def create_admin(email):
    "Create an admin user to allow usage of the API when database is empty."
    "Set password is 'default'."

    try:
        # Allow "admin@example.com" to be invalid.
        if email != "admin@example.com":
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


@cli.command('clear_all_auth_tokens')
def clear_all_auth_tokens():
    "Remove all authentication tokens."
    commands.clean_auth_tokens()


@cli.command('init_data')
def init_data():
    commands.init_data()


@cli.command()
def patch_set_done_flag_on_task_status():
    """
    Patch to run after upgrade from 0.4.8 or lower to 0.4.9 or superior.
    """
    for task_status in tasks_service.get_task_statuses():
        tasks_service.update_task_status(task_status["id"], {
            "is_done": task_status["short_name"] == "done"
        })


@cli.command()
def patch_scene_asset_instance():
    """
    Patch to run after upgrade from 0.6.1 or lower to 0.6.2 or superior.
    It concerns only casting based on instances.
    """
    from zou.app.models.asset_instance import AssetInstance
    for asset_instance in AssetInstance.query.all():
        try:
            asset_instance.update({
                "scene_id": asset_instance.entity_id
            })
        except:
            print(asset_instance.serialize())


if __name__ == '__main__':
    cli()
