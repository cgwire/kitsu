from tests.base import ApiDBTestCase

from zou.app.models.entity import Entity
from zou.app.models.comment import Comment

from zou.app.utils import fields


class CommentTestCase(ApiDBTestCase):

    def setUp(self):
        super(CommentTestCase, self).setUp()
        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_person()
        self.generate_fixture_asset_type()
        self.entities = self.generate_data(
            Entity,
            3,
            entities_out=[],
            entities_in=[],
            project_id=self.project.id,
            entity_type_id=self.asset_type.id
        )
        self.comments = self.generate_data(
            Comment,
            3,
            text="test comment",
            object_id=self.entities[0].id,
            person_id=self.person.id
        )

    def test_repr(self):
        self.assertEqual(
            str(self.comments[0]),
            "<Comment of %s>" % self.comments[0].object_id
        )

    def test_get_comments(self):
        comments = self.get("data/comments")
        self.assertEquals(len(comments), 3)

    def test_get_comment(self):
        comment = self.get_first("data/comments")
        comment_again = self.get("data/comments/%s" % comment["id"])
        self.assertEquals(comment, comment_again)
        self.get_404("data/comments/%s/" % fields.gen_uuid())

    def test_create_comment(self):
        data = {
            "object_type": "shot",
            "object_id": self.entities[0].id,
            "person_id": self.person.id,
            "text": "New comment"
        }
        self.comment = self.post("data/comments", data)
        self.assertIsNotNone(self.comment["id"])

        comments = self.get("data/comments")
        self.assertEquals(len(comments), 4)

    def test_update_comment(self):
        comment = self.get_first("data/comments")
        data = {
            "text": "Edited comment"
        }
        self.put("data/comments/%s" % comment["id"], data)
        comment_again = self.get("data/comments/%s" % comment["id"])
        self.assertEquals(data["text"], comment_again["text"])
        comment_id = fields.gen_uuid()
        self.put_404("data/comments/%s" % comment_id, data)

    def test_delete_comment(self):
        comments = self.get("data/comments")
        self.assertEquals(len(comments), 3)
        comment = comments[0]
        self.delete("data/comments/%s" % comment["id"])
        comments = self.get("data/comments")
        self.assertEquals(len(comments), 2)
        self.delete_404("data/comments/%s" % fields.gen_uuid())
