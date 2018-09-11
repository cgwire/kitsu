from flask import Blueprint
from zou.app.utils.api import configure_api_from_blueprint

from .resources import (
    DesktopLoginsResource,
    NewPersonResource,
    PersonMonthTimeSpentsResource,
    PersonWeekTimeSpentsResource,
    PersonDayTimeSpentsResource,
    PresenceLogsResource,
    TimeSpentsResource,
    TimeSpentMonthResource,
    TimeSpentWeekResource,
    TimeSpentYearResource
)

routes = [
    ("/data/persons/new", NewPersonResource),

    ("/data/persons/<person_id>/desktop-login-logs", DesktopLoginsResource),
    ("/data/persons/presence-logs/<month_date>", PresenceLogsResource),

    ("/data/persons/<person_id>/time-spents/<date>", TimeSpentsResource),
    ("/data/persons/<person_id>/time-spents/month/<year>/<month>", PersonMonthTimeSpentsResource),
    ("/data/persons/<person_id>/time-spents/week/<year>/<week>", PersonWeekTimeSpentsResource),
    ("/data/persons/<person_id>/time-spents/day/<year>/<month>/<day>", PersonDayTimeSpentsResource),
    ("/data/persons/time-spents/month-table/<year>", TimeSpentYearResource),
    ("/data/persons/time-spents/week-table/<year>", TimeSpentWeekResource),
    ("/data/persons/time-spents/day-table/<year>/<month>", TimeSpentMonthResource)
]

blueprint = Blueprint("persons", "persons")
api = configure_api_from_blueprint(blueprint, routes)
