import datetime

from dateutil import relativedelta

from zou.app.models.time_spent import TimeSpent


def get_month_table(year):
    """
    Return a table giving time spent by user and by month for given year.
    """
    time_spents = TimeSpent.query \
        .filter(TimeSpent.date.between(
            "%s-01-01" % year,
            "%s-12-31" % year
        )) \
        .all()

    result = {}
    for time_spent in time_spents:
        month = str(time_spent.date.month)
        person_id = str(time_spent.person_id)
        if month not in result:
            result[month] = {}
        if person_id not in result[month]:
            result[month][person_id] = 0
        result[month][person_id] += time_spent.duration

    return result


def get_day_table(year, month):
    """
    Return a table giving time spent by user and by day for given year and
    month.
    """
    date = datetime.datetime(int(year), int(month), 1)
    next_month = date + relativedelta.relativedelta(months=1)
    time_spents = TimeSpent.query \
        .filter(TimeSpent.date >= date.strftime("%Y-%m-%d")) \
        .filter(TimeSpent.date < next_month.strftime("%Y-%m-%d")) \
        .all()

    result = {}
    for time_spent in time_spents:
        day = str(time_spent.date.day)
        person_id = str(time_spent.person_id)
        if day not in result:
            result[day] = {}
        if person_id not in result[day]:
            result[day][person_id] = 0
        result[day][person_id] += time_spent.duration

    return result
