from zou.app.models.file_status import FileStatus
from zou.app import app

from zou.app.models.working_file import WorkingFile
from zou.app.models.output_file import OutputFile
from zou.app.models.output_type import OutputType
from zou.app.models.preview_file import PreviewFile
from zou.app.models.software import Software
from zou.app.models.task import Task

from zou.app.services.exception import (
    WorkingFileNotFoundException,
    OutputFileNotFoundException,
    OutputTypeNotFoundException,
    PreviewFileNotFoundException,
    SoftwareNotFoundException,
    NoOutputFileException,
    EntryAlreadyExistsException
)

from sqlalchemy import desc
from sqlalchemy.exc import StatementError, IntegrityError


def get_default_status():
    default_status = FileStatus.get_by(
        name=app.config["DEFAULT_FILE_STATUS"]
    )
    if default_status is None:
        default_status = FileStatus(
            name=app.config["DEFAULT_FILE_STATUS"],
            color="#FFFFFF"
        )
        default_status.save()
    return default_status


def get_instance(model, instance_id, exception):
    try:
        instance = model.get(instance_id)
    except StatementError:
        raise exception()

    if instance is None:
        raise exception()

    return instance


def get_or_create_instance_by_name(model, **kwargs):
    instance = model.get_by(name=kwargs["name"])
    if instance is None:
        instance = model.create(**kwargs)
    return instance


def get_working_file(working_file_id):
    return get_instance(
        WorkingFile,
        working_file_id,
        WorkingFileNotFoundException
    )


def get_output_file(output_file_id):
    return get_instance(
        OutputFile,
        output_file_id,
        OutputFileNotFoundException
    )


def get_software(software_id):
    return get_instance(
        Software,
        software_id,
        SoftwareNotFoundException
    )


def get_output_type(output_type_id):
    return get_instance(
        OutputType,
        output_type_id,
        OutputTypeNotFoundException
    )


def get_or_create_output_type(name, short_name=""):
    return get_or_create_instance_by_name(
        OutputType,
        name=name,
        short_name=short_name
    )


def get_or_create_software(name, short_name, file_extension):
    return get_or_create_instance_by_name(
        Software,
        name=name,
        short_name=short_name,
        file_extension=file_extension
    )


def get_last_working_files_for_task(task_id):
    result = {}
    max_revisions = {}
    working_files = get_working_files_for_task(task_id)
    for working_file in working_files:
        name = working_file["name"]
        revision = working_file["revision"]
        if name not in result:
            max_revisions[name] = revision
            result[name] = working_file
    return result


def get_next_working_revision(task_id, name):
    working_files = WorkingFile.query.filter_by(
        task_id=task_id,
        name=name
    ).order_by(desc(WorkingFile.revision)).all()
    if len(working_files) > 0:
        revision = working_files[0].revision + 1
    else:
        revision = 1
    return revision


def create_new_working_revision(
    task_id,
    person_id,
    software_id,
    name="main",
    path="",
    comment="",
    revision=0
):
    task = Task.get(task_id)
    if revision == 0:
        revision = get_next_working_revision(task_id, name)

    try:
        working_file = WorkingFile.create(
            comment=comment,
            name=name,
            revision=revision,
            path=path,
            task_id=task.id,
            software_id=software_id,
            entity_id=task.entity_id,
            person_id=person_id
        )
    except IntegrityError:
        raise EntryAlreadyExistsException

    return working_file.serialize()


def create_new_output_revision(
    entity_id,
    task_id,
    working_file_id,
    output_type_id,
    person_id,
    comment="",
    revision=0,
    name=""
):
    if revision < 1:
        try:
            output_file = get_last_output_revision(
                task_id,
                output_type_id
            )
            revision = output_file.revision + 1
        except NoOutputFileException:
            revision = 1

    file_status_id = get_default_status().id

    output_file = OutputFile(
        name=name,
        comment=comment,
        revision=revision,
        task_id=task_id,
        entity_id=entity_id,
        person_id=person_id,
        source_file_id=working_file_id,
        output_type_id=output_type_id,
        file_status_id=file_status_id
    )
    output_file.save()

    return output_file


def get_last_output_revision(task_id, output_type_id):
    output_files = OutputFile.query.filter_by(
        output_type_id=output_type_id,
        task_id=task_id
    ).filter(
        OutputFile.revision > 0
    ).order_by(
        desc(OutputFile.revision)
    ).all()

    if len(output_files) == 0:
        raise NoOutputFileException()

    return output_files[0]


def get_working_files_for_task(task_id):
    working_files = WorkingFile.query.filter_by(
        task_id=task_id
    ).filter(
        WorkingFile.revision >= 0
    ).order_by(
        desc(WorkingFile.revision)
    ).all()
    return WorkingFile.serialize_list(working_files)


def get_next_output_file_revision(task_id, output_type_id, name="main"):
    output_files = OutputFile.query.filter_by(
        task_id=task_id,
        output_type_id=output_type_id,
        name=name
    ).filter(
        OutputFile.revision >= 0
    ).order_by(
        desc(OutputFile.revision)
    ).all()
    if len(output_files) > 0:
        return output_files[0].revision + 1
    else:
        return 1


def get_output_files_for_task(task_id):
    output_files = OutputFile.query.filter_by(
        task_id=task_id
    ).filter(
        OutputFile.revision >= 0
    ).order_by(
        desc(OutputFile.revision)
    ).all()
    return OutputFile.serialize_list(output_files)


def get_last_output_files_for_task(task_id):
    result = {}
    max_revisions = {}
    output_files = get_output_files_for_task(task_id)
    for output_file in output_files:
        output_type_id = output_file["output_type_id"]
        revision = output_file["revision"]
        if output_type_id not in result:
            max_revisions[output_type_id] = revision
            result[output_type_id] = output_file
    return result


def get_preview_file(preview_file_id):
    try:
        preview_file = PreviewFile.get(preview_file_id)
    except StatementError:
        raise PreviewFileNotFoundException()

    if preview_file is None:
        raise PreviewFileNotFoundException()

    return preview_file


def get_preview_files_for_task(task_id):
    previews = PreviewFile.filter_by(
        task_id=task_id
    ).order_by(
        PreviewFile.revision.desc()
    )
    return PreviewFile.serialize_list(previews)


def create_preview_file(
    name,
    revision,
    task_id,
    person_id,
    is_movie,
    source="webgui"
):
    return PreviewFile.create(
        name=name,
        revision=revision,
        source=source,
        task_id=task_id,
        person_id=person_id,
        is_movie=is_movie
    )
