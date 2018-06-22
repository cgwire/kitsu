from zou.app.services import shots_service
from zou.app.utils import events


def add_shot_to_scene(scene, shot):
    """
    Link a shot to a scene. Once done, the scene is considered as the source
    of the scene.
    """
    shot = shots_service.update_shot(shot["id"], {
        "source_id": scene["id"]
    })
    events.emit("shot:add-to-scene", {
        "scene_id": scene["id"],
        "shot_id": shot["id"]
    })
    return shot


def remove_shot_from_scene(scene, shot):
    """
    Remove link from a shot to a scene.
    """
    shot = shots_service.update_shot(shot["id"], {
        "source_id": None
    })
    events.emit("shot:remove-from-scene", {
        "scene_id": scene["id"],
        "shot_id": shot["id"]
    })
    return shot


def get_shots_by_scene(scene_id):
    """
    Get shots linked to a scene (of which the source is the given scene).
    """
    return shots_service.get_shots({"source_id": scene_id})
