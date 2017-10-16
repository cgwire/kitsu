from zou.app.models.entity import Entity


def update_casting(shot, casting):
    assets = [Entity.get(asset_id) for asset_id in casting]
    assets = [asset for asset in assets if asset is not None]
    shot.update({"entities_out": assets})
    return shot.serialize()
