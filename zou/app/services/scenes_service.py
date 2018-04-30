from zou.app.services import shots_service


def add_shot_to_scene(scene, shot):
    """
    Link a shot to a scene. Once done, the scene is considered as the source
    of the scene.
    """
    return shots_service.update_shot(shot["id"], {
        "source_id": scene["id"]
    })


def remove_shot_from_scene(scene, shot):
    """
    Remove link from a shot to a scene.
    """
    return shots_service.update_shot(shot["id"], {
        "source_id": None
    })


def get_shots_by_scene(scene_id):
    """
    Get shots linked to a scene (of which the source is the given scene).
    """
    return shots_service.get_shots({"source_id": scene_id})
