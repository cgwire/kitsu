from zou.app.models.file_status import FileStatus
from zou.app import app

from zou.app.models.working_file import WorkingFile
from zou.app.models.output_file import OutputFile
from zou.app.models.preview_file import PreviewFile

from zou.app.project.exception import (
    WorkingFileNotFoundException,
    OutputFileNotFoundException,
    PreviewFileNotFoundException,
    NoOutputFileException
)

from sqlalchemy import desc
from sqlalchemy.exc import StatementError


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


def get_working_file(working_file_id):
    try:
        working_file = WorkingFile.get(working_file_id)
    except StatementError:
        raise WorkingFileNotFoundException()

    if WorkingFile is None:
        raise WorkingFileNotFoundException()

    return working_file


def get_output_file(output_file_id):
    try:
        output_file = OutputFile.get(output_file_id)
    except StatementError:
        raise OutputFileNotFoundException()

    if OutputFile is None:
        raise OutputFileNotFoundException()

    return output_file


def create_new_working_revision(entity_id, task_id,
                                person_id, comment, revision=0):
    working_files = WorkingFile.query.filter_by(
        entity_id=entity_id,
        task_id=task_id
    ).order_by(desc(WorkingFile.revision)).all()

    if revision == 0 and len(working_files) > 0:
        revision = working_files[0].revision + 1
    elif revision == 0:
        revision = 1

    working_file = WorkingFile(
        comment=comment,
        revision=revision,
        task_id=task_id,
        entity_id=entity_id,
        person_id=person_id
    )
    working_file.save()

    return working_file


def get_last_output_revision(task_id, entity_id):
    output_files = OutputFile.query.filter_by(
        entity_id=entity_id,
        task_id=task_id
    ).filter(
        OutputFile.revision >= 0
    ).order_by(
        desc(OutputFile.revision)
    ).all()

    if len(output_files) == 0:
        raise NoOutputFileException()

    return output_files[0]


def create_new_output_revision(entity_id, task_id,
                               person_id, comment, revision=0):
    try:
        output_file = get_last_output_revision(task_id, entity_id)
        revision = output_file.revision + 1
    except NoOutputFileException:
        revision = 1

    file_status_id = get_default_status().id

    output_file = OutputFile(
        comment=comment,
        revision=revision,
        task_id=task_id,
        entity_id=entity_id,
        person_id=person_id,
        file_status_id=file_status_id
    )
    output_file.save()

    return output_file


def get_next_output_revision_number(task):
    try:
        output_file = get_last_output_revision(task.id, task.entity_id)
        revision = output_file.revision + 1
    except NoOutputFileException:
        revision = 1

    return revision


def get_preview_file(preview_file_id):
    try:
        preview_file = PreviewFile.get(preview_file_id)
    except StatementError:
        raise PreviewFileNotFoundException()

    if preview_file is None:
        raise PreviewFileNotFoundException()

    return preview_file
