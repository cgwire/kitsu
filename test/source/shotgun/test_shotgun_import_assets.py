# -*- coding: UTF-8 -*-
from test.source.shotgun.base import ShotgunTestCase

from zou.app.models.project import Project


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
            "id": 3
        }

        api_path = "data/import/shotgun/assets"
        self.assets = self.post(api_path, [sg_asset], 200)
        self.assertEqual(len(self.assets), 1)

        self.assets = self.get("data/entities")
        self.assertEqual(len(self.assets), 1)

        asset = self.assets[0]
        print(sg_asset["project"]["name"])
        project = Project.get_by(shotgun_id=sg_asset["project"]["id"])
        self.assertEqual(asset["description"], sg_asset["description"])
        self.assertEqual(asset["shotgun_id"], sg_asset["id"])
        self.assertEqual(asset["project_id"], str(project.id))
