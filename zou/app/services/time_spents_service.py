import datetime

from dateutil import relativedelta

from zou.app.models.time_spent import TimeSpent


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
