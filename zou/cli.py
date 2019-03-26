#!/usr/bin/env python
import os
import sys
import flask_migrate
import click

from sqlalchemy.exc import IntegrityError

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
def migrate_db():
    "Upgrade database schema."

    from zou.app import app
    with app.app_context():
        import zou
        directory = os.path.join(
            os.path.dirname(zou.__file__), "migrations"
        )
        flask_migrate.migrate(directory=directory)


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
@click.option('--password', default="default")
def create_admin(email, password):
    "Create an admin user to allow usage of the API when database is empty."
    "Set password is 'default'."

    try:
        # Allow "admin@example.com" to be invalid.
        if email != "admin@example.com":
            auth.validate_email(email)
        password = auth.encrypt_password(password)
        persons_service.create_person(
            email,
            password,
            "Super",
            "Admin",
            role="admin"
        )
        print("Admin successfully created.")

    except IntegrityError:
        print("User already exists for this email.")
        sys.exit(1)

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
    commands.clear_all_auth_tokens()


@cli.command('init_data')
def init_data():
    commands.init_data()


@cli.command('set_default_password')
@click.argument("email")
def set_default_password(email):
    "Set the password of given user as default"
    from zou.app.services import persons_service
    from zou.app.utils import auth
    password = auth.encrypt_password("default")
    persons_service.update_password(email, password)


@cli.command()
def sync_with_ldap_server():
    """
    For each user account in your LDAP server, it creates a new user.
    """
    commands.sync_with_ldap_server()


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


@cli.command()
def patch_file_storage():
    """
    Patch to run after upgrade from 0.7.6 or lower to 0.8.0 or superior.
    It concerns only files stored on the hard drive.
    """
    from zou import app
    from zou.app import config
    from zou.app.stores import file_store
    from zou.app.services import files_service

    with app.app.app_context():
        if hasattr(config, "THUMBNAIL_FOLDER",):
            preview_folder = config.THUMBNAIL_FOLDER
        else:
            preview_folder = config.PREVIEW_FOLDER

        print("Looking for existing file in %s" % preview_folder)
        originals_folder = os.path.join(
            preview_folder,
            "preview-files",
            "originals"
        )

        if os.path.exists(originals_folder):
            for folder in os.listdir(originals_folder):
                subfolder = os.path.join(".", originals_folder, folder)
                print("Looking into folder: %s" % subfolder)

                for filename in os.listdir(subfolder):
                    file_path = os.path.join(subfolder, filename)
                    print("Loading file: %s" % file_path)
                    instance_id = filename.split(".")[0]
                    extension = filename.split(".")[1]

                    if extension == "png":
                        file_store.add_picture(
                            "originals",
                            instance_id,
                            file_path
                        )
                    elif extension == "mp4":
                        file_store.add_movie("previews", instance_id, file_path)
                    else:
                        file_store.add_file("previews", instance_id, file_path)

                    print("Original file stored: (%s, %s)" % (
                        instance_id,
                        extension
                    ))
                    try:
                        files_service.update_preview_file(
                            instance_id, {"exstension": extension}
                        )
                    except:
                        print(
                            "Warning: preview file entry "
                            "not found: %s." % instance_id
                        )

        for prefix in ["thumbnails", "thumbnails-square", "previews"]:
            folder = os.path.join(preview_folder, "preview-files", prefix)

            if os.path.exists(folder):
                for subfoldername in os.listdir(folder):
                    subfolder = os.path.join(".", folder, subfoldername)

                    for filename in os.listdir(subfolder):
                        file_path = os.path.join(subfolder, filename)
                        instance_id = filename.split(".")[0]

                        file_store.add_picture(
                            prefix,
                            instance_id,
                            file_path
                        )
                        print("%s file stored: %s" % (prefix, instance_id))

        for prefix in ["persons", "projects"]:
            folder = os.path.join(
                preview_folder,
                prefix
            )

            if os.path.exists(folder):
                for filename in os.listdir(folder):
                    file_path = os.path.join(folder, filename)
                    instance_id = filename.split(".")[0]
                    file_store.add_picture("thumbnails", instance_id, file_path)
                    print("%s file stored: %s" % (prefix, instance_id))


@cli.command()
def patch_task_type_allow_timelog():
    """
    Patch to run after upgrade from 0.7.3 or lower to 0.7.4 or superior.
    """
    from zou.app.models.task_type import TaskType
    for task_type in TaskType.query.all():
        try:
            task_type.update({
                "allow_timelog": True
            })
        except:
            print(task_type.serialize())


@cli.command()
def patch_team():
    """
    Patch to run after upgrade from 0.7.10 or lower to 0.8.0 or superior.
    """
    from zou.app.models.project import Project
    from zou.app.models.person import Person
    from zou.app.models.task import Task
    for project in Project.query.all():
        for person in Person.query.all():
            task = Task.query \
              .filter(Task.project_id == project.id) \
              .filter(Task.assignees.contains(person)) \
              .first()
            if task is not None:
                project.team.append(person)
                project.save()


@cli.command()
def patch_task_data():
    """
    Patch to run after upgrade from 0.9.8 or lower to 0.9.9 or superior.
    """
    from zou.app.models.task import Task
    from zou.app.services import projects_service, deletion_service

    for project in projects_service.open_projects():
        print("Cleaning tasks for project %s" % project["name"])
        for task in Task.get_all_by(project_id=project["id"]):
            deletion_service.reset_task_data(task.id)
    print("Task cleaning done.")


if __name__ == '__main__':
    cli()
