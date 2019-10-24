from datetime import date, timedelta


def get_date_from_now(nb_days):
    return date.today() - timedelta(days=nb_days)
