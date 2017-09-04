# -*- coding: UTF-8 -*-
from test.source.shotgun.base import ShotgunTestCase

from zou.app.models.project import Project
from zou.app.models.entity import Entity


class ImportShotgunShotTestCase(ShotgunTestCase):

    def setUp(self):
        super(ImportShotgunShotTestCase, self).setUp()

    def test_import_assets(self):
        self.load_fixture('projects')
        self.entities = self.load_fixture('assets')
        self.assertEqual(len(self.entities), 2)

        self.entities = self.get("data/entities")
        self.assertEqual(len(self.entities), 2)

    def test_import_twice_assets(self):
        self.load_fixture('projects')
        self.entities = self.load_fixture('assets')
        self.entities = self.load_fixture('assets')
        self.assertEqual(len(self.entities), 2)

        self.entities = self.get("data/entities")
        self.assertEqual(len(self.entities), 2)

    def test_import_asset(self):
        self.load_fixture('projects')
        self.load_fixture('assets')
        sg_asset = {
            "code": "Cake",
            "description": "yellow cake",
            "project": {
                "type": "Project",
                "id": 1,
                "name": "Cosmos Landromat"
            },
            "sg_asset_type": "Props",
            "type": "Asset",
            "parents": [{"type": "Asset", "id": 1}],
            "id": 3
        }

        api_path = "/import/shotgun/assets"
        self.assets = self.post(api_path, [sg_asset], 200)
        self.assertEqual(len(self.assets), 1)

        self.assets = self.get("data/entities")
        self.assertEqual(len(self.assets), 3)

        asset = self.assets[2]
        project = Project.get_by(shotgun_id=sg_asset["project"]["id"])
        self.assertEqual(asset["description"], sg_asset["description"])
        self.assertEqual(asset["shotgun_id"], sg_asset["id"])
        self.assertEqual(asset["project_id"], str(project.id))
        self.assertEqual(len(asset["entities_out"]), 0)

        parent = Entity.get_by(shotgun_id=1)
        self.assertEqual(str(parent.entities_out[0].id), asset["id"])
