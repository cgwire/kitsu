def get_query_criterions_from_request(request):
    criterions = {}
    for key, value in request.args.items():
        if key not in ["page"]:
            criterions[key] = value
    return criterions
