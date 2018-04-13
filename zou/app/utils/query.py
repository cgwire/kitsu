def get_query_criterions_from_request(request):
    """
    Turn request parameters into a dict where keys are attributes to filter and
    values are values to filter.
    """
    criterions = {}
    for key, value in request.args.items():
        if key not in ["page"]:
            criterions[key] = value
    return criterions


def get_page_from_request(request):
    """
    Return page parameter value (given through request query or post body).
    Default value is 1.
    """
    return request.args.get("page", 1)


def apply_criterions_to_db_query(model, db_query, criterions):
    """
    Apply criterions given in HTTP request to the sqlachemy db query object.
    """
    if "name" in criterions and hasattr(model, "name"):
        value = criterions["name"]
        db_query = db_query.filter(model.name.ilike(value))
        del criterions["name"]

    return db_query.filter_by(**criterions)
