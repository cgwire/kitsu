from sqlalchemy_utils import UUIDType
from zou.app import db
from zou.app.models.serializer import SerializerMixin
from zou.app.models.base import BaseMixin


assignees_table = db.Table(
    'assignations',
    db.Column(
        'task',
        UUIDType(binary=False),
        db.ForeignKey('task.id'),
        primary_key=True
    ),
    db.Column(
        'person',
        UUIDType(binary=False),
        db.ForeignKey('person.id'),
        primary_key=True
    )
)


class Task(db.Model, BaseMixin, SerializerMixin):
    """
    Describes a task done by a CG artist on an entity of the CG production.
    The task has a state and assigned to people. It handles notion of time like
    duration, start date and end date.
    """
    name = db.Column(db.String(80), nullable=False)
    description = db.Column(db.String(200))

    priority = db.Column(db.Integer, default=0)
    duration = db.Column(db.Integer, default=0)
    estimation = db.Column(db.Integer, default=0)
    completion_rate = db.Column(db.Integer, default=0)
    retake_count = db.Column(db.Integer, default=0)
    sort_order = db.Column(db.Integer, default=0)
    start_date = db.Column(db.DateTime)
    end_date = db.Column(db.DateTime)
    due_date = db.Column(db.DateTime)
    real_start_date = db.Column(db.DateTime)
    last_comment_date = db.Column(db.DateTime)
    shotgun_id = db.Column(db.Integer)

    project_id = db.Column(
        UUIDType(binary=False),
        db.ForeignKey('project.id'),
        index=True
    )
    task_type_id = db.Column(
        UUIDType(binary=False),
        db.ForeignKey('task_type.id')
    )
    task_status_id = db.Column(
        UUIDType(binary=False),
        db.ForeignKey('task_status.id')
    )
    entity_id = db.Column(
        UUIDType(binary=False),
        db.ForeignKey('entity.id'),
        index=True
    )
    assigner_id = db.Column(
        UUIDType(binary=False),
        db.ForeignKey('person.id')
    )
    assignees = db.relationship(
        'Person',
        secondary=assignees_table
    )

    __table_args__ = (
        db.UniqueConstraint(
            'name',
            'project_id',
            'task_type_id',
            'entity_id',
            name='task_uc'
        ),
    )

    def assignees_as_string(self):
        return ", ".join([x.full_name() for x in self.assignees])
