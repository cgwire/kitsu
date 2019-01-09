import datetime
import isoweek

from dateutil import relativedelta

from sqlalchemy import func
from sqlalchemy.exc import DataError
from sqlalchemy.orm import aliased

from zou.app.models.project import Project
from zou.app.models.task import Task
from zou.app.models.time_spent import TimeSpent
from zou.app.models.entity import Entity
from zou.app.models.entity_type import EntityType

from zou.app.utils import fields

from zou.app.services.exception import (
    WrongDateFormatException
)


def get_month_table(year):
    """
    Return a table giving time spent by user and by month for given year.
    """
    return get_yearly_table(year)


def get_week_table(year):
    """
    Return a table giving time spent by user and by week for given year.
    """
    return get_yearly_table(year, "week")


def get_day_table(year, month):
    """
    Return a table giving time spent by user and by day for given year and
    month.
    """
    time_spents = get_time_spents_for_month(year, month)
    return get_table_from_time_spents(time_spents, "day")


def get_yearly_table(year, detail_level="month"):
    """
    Return a table giving time spent by user and by week or month for given
    year. Week or month detail level can be selected through *detail_level*
    argument.
    """
    time_spents = get_time_spents_for_year(year)
    return get_table_from_time_spents(time_spents, detail_level)


def get_time_spents_for_year(year):
    """
    Return all time spents for given year.
    """
    return TimeSpent.query \
        .filter(TimeSpent.date.between(
            "%s-01-01" % year,
            "%s-12-31" % year
        )) \
        .all()


def get_time_spents_for_month(year, month):
    """
    Return all time spents for given month.
    """
    date = datetime.datetime(int(year), int(month), 1)
    next_month = date + relativedelta.relativedelta(months=1)
    return TimeSpent.query \
        .filter(TimeSpent.date >= date.strftime("%Y-%m-%d")) \
        .filter(TimeSpent.date < next_month.strftime("%Y-%m-%d")) \
        .all()


def get_table_from_time_spents(time_spents, detail_level="month"):
    """
    Buid a time spent table based on given time spents and given level
    of detail (week, day or month).
    """
    result = {}
    for time_spent in time_spents:
        if detail_level is "week":
            unit = str(time_spent.date.isocalendar()[1])
        elif detail_level is "day":
            unit = str(time_spent.date.day)
        else:
            unit = str(time_spent.date.month)

        person_id = str(time_spent.person_id)
        if unit not in result:
            result[unit] = {}
        if person_id not in result[unit]:
            result[unit][person_id] = 0
        result[unit][person_id] += time_spent.duration
    return result


def get_time_spents(person_id, date):
    """
    Return time spents for given person and date.
    """
    try:
        time_spents = TimeSpent.query \
            .filter_by(person_id=person_id, date=date) \
            .all()
    except DataError:
        raise WrongDateFormatException
    return fields.serialize_list(time_spents)


def get_month_time_spents(person_id, year, month):
    """
    Return aggregated time spents at task level for given person and month.
    """
    year = int(year)
    month = int(month)
    if year > datetime.datetime.now().year \
       or year < 2010 or month < 1 or month > 12:
        raise WrongDateFormatException

    date = datetime.datetime(year, month, 1)
    next_month = date + relativedelta.relativedelta(months=1)

    entries = get_person_time_spent_entries(
        person_id,
        TimeSpent.date >= date.strftime("%Y-%m-%d"),
        TimeSpent.date < next_month.strftime("%Y-%m-%d")
    )

    return build_results(entries)


def get_week_time_spents(person_id, year, week):
    """
    Return aggregated time spents at task level for given person and week.
    """
    year = int(year)
    week = int(week)
    if year > datetime.datetime.now().year \
       or year < 2010 or week < 1 or week > 52:
        raise WrongDateFormatException

    date = isoweek.Week(year, week).monday()
    next_week = date + relativedelta.relativedelta(days=7)

    entries = get_person_time_spent_entries(
        person_id,
        TimeSpent.date >= date.strftime("%Y-%m-%d"),
        TimeSpent.date < next_week.strftime("%Y-%m-%d")
    )

    return build_results(entries)


def get_day_time_spents(person_id, year, month, day):
    """
    Return aggregated time spents at task level for given person and day.
    """
    year = int(year)
    month = int(month)
    day = int(day)
    if year > datetime.datetime.now().year or year < 2010 \
       or month < 1 or month > 12 \
       or day < 1 or day > 31:
        raise WrongDateFormatException

    date = datetime.datetime(year, month, day)
    entries = get_person_time_spent_entries(
        person_id,
        TimeSpent.date == date
    )
    return build_results(entries)


def get_person_time_spent_entries(person_id, *args):
    """
    Return aggregated time spents at task level for given person and
    query filter (args).
    """
    Sequence = aliased(Entity, name='sequence')
    Episode = aliased(Entity, name='episode')
    query = Task.query \
        .with_entities(Task.id, Task.task_type_id) \
        .join(Entity, Entity.id == Task.entity_id) \
        .join(Project, Project.id == Task.project_id) \
        .join(TimeSpent) \
        .join(EntityType) \
        .group_by(
            Task.id,
            Task.task_type_id,
            Project.id,
            Project.name,
            Entity.name,
            EntityType.name,
            Sequence.name,
            Episode.name
        ) \
        .outerjoin(Sequence, Sequence.id == Entity.parent_id) \
        .outerjoin(Episode, Episode.id == Sequence.parent_id) \
        .filter(TimeSpent.person_id == person_id) \
        .add_columns(
            Project.id,
            Project.name,
            Entity.name,
            EntityType.name,
            Sequence.name,
            Episode.name,
            func.sum(TimeSpent.duration)
        )

    for arg in args:
        query = query.filter(arg)

    return query.all()


def build_results(entries):
    """
    Build results with information to build a time sheet based on given entries
    (tasks + time spent duration aggregate)
    """
    result = []
    for (
        task_id,
        task_type_id,
        project_id,
        project_name,
        entity_name,
        entity_type_name,
        sequence_name,
        episode_name,
        duration
    ) in entries:
        result.append({
            "task_id": str(task_id),
            "task_type_id": str(task_type_id),
            "project_id": str(project_id),
            "project_name": project_name,
            "entity_name": entity_name,
            "entity_type_name": entity_type_name,
            "sequence_name": sequence_name,
            "episode_name": episode_name,
            "duration": duration
        })
    return result
