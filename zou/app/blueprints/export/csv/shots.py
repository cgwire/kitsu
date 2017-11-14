from sqlalchemy.orm import aliased

from zou.app.blueprints.export.csv.base import BaseCsvExport

from zou.app.models.project import Project
from zou.app.models.entity import Entity

from zou.app.services import shots_service


class ShotsCsvExport(BaseCsvExport):

    def __init__(self):
        BaseCsvExport.__init__(self, Entity)

    def build_headers(self):
        return [
            "Project",
            "Sequence",
            "Name",
            "Description",
            "FPS",
            "Frame In",
            "Frame Out"
        ]

    def build_query(self):
        shot_type = shots_service.get_shot_type()
        Sequence = aliased(Entity, name='sequence')
        query = self.model.query.filter_by(entity_type_id=shot_type["id"])
        query = query.join(Project)
        query = query.join(Sequence, Sequence.id == Entity.parent_id)
        query = query.add_columns(Project.name)
        query = query.add_columns(Sequence.name)
        query = query.order_by(Project.name, Sequence.name, Entity.name)
        return query

    def build_row(self, shot_data):
        (shot, project_name, sequence_name) = shot_data
        return [
            project_name,
            sequence_name,
            shot.name,
            shot.description,
            shot.data.get("fps", ""),
            shot.data.get("frame_in", ""),
            shot.data.get("frame_out", "")
        ]
