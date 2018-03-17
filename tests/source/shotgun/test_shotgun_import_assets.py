# -*- coding: UTF-8 -*-
from tests.source.shotgun.base import ShotgunTestCase

from zou.app.models.project import Project
from zou.app.models.entity import Entity


class ImportShotgunAssetTestCase(ShotgunTestCase):

    def setUp(self):
        super(ImportShotgunAssetTestCase, self).setUp()

    def test_import_assets(self):
        self.load_fixture('projects')
        self.entities = self.load_fixture('assets')
        self.assertEqual(len(self.entities), 2)

        self.entities = self.get("data/assets/all")
        self.assertEqual(len(self.entities), 2)

    def test_import_twice_assets(self):
        self.load_fixture('projects')
        self.entities = self.load_fixture('assets')
        self.entities = self.load_fixture('assets')
        self.assertEqual(len(self.entities), 2)

        self.entities = self.get("data/assets/all")
        self.assertEqual(len(self.entities), 2)

    def test_import_asset(self):
        self.generate_fixture_asset_type()
        self.generate_fixture_project_status()
        self.generate_fixture_project()
        self.generate_fixture_sequence()
        self.generate_fixture_shot()
        self.shot.update({"shotgun_id": 3})

        self.load_fixture('projects')
        self.load_fixture('assets')
        sg_asset = {
            "code": "Cake",
            "description": "yellow cake",
            "project": {
                "type": "Project",
                "id": 1,
                "name": "Agent 327"
            },
            "sg_asset_type": "Props",
            "type": "Asset",
            "parents": [{"type": "Asset", "id": 1}],
            "id": 3
        }

        api_path = "/import/shotgun/assets"
        self.assets = self.post(api_path, [sg_asset], 200)
        self.assertEqual(len(self.assets), 1)

        self.assets = self.get("data/assets/all")
        self.assertEqual(len(self.assets), 3)

        assets = sorted(self.assets, key=lambda x: x["name"])
        asset = assets[0]
        project = Project.get_by(shotgun_id=sg_asset["project"]["id"])
        self.assertEqual(asset["description"], sg_asset["description"])
        self.assertEqual(asset["shotgun_id"], sg_asset["id"])
        self.assertEqual(asset["project_id"], str(project.id))
        self.assertEqual(len(asset["entities_out"]), 0)

        parent = Entity.get_by(shotgun_id=1)
        self.assertEqual(str(parent.entities_out[0].id), asset["id"])

    def test_remove_asset(self):
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
            "parents": [],
            "id": 3
        }

        api_path = "/import/shotgun/assets"
        self.assets = self.post(api_path, [sg_asset], 200)
        asset = self.assets[0]

        self.assets = self.get("data/assets/all")
        self.assertEqual(len(self.assets), 3)

        api_path = "/import/shotgun/remove/asset"
        self.assets = self.post(api_path, {"id": sg_asset["id"]}, 200)

        self.assets = self.get("data/assets/all")
        self.assertEqual(len(self.assets), 2)

        self.get("data/assets/%s" % asset["id"], 404)

    def test_remove_asset_with_working_files(self):
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
            "parents": [],
            "id": 3
        }

        api_path = "/import/shotgun/assets"
        self.assets = self.post(api_path, [sg_asset], 200)
        asset = self.assets[0]
        self.asset = Entity.get(asset["id"])
        self.generate_fixture_project_status()
        self.generate_fixture_file_status()
        self.generate_fixture_person()
        self.generate_fixture_assigner()
        self.generate_fixture_software()
        self.generate_fixture_project()
        self.generate_fixture_department()
        self.generate_fixture_task_type()
        self.generate_fixture_task_status()

        self.generate_fixture_task()
        self.generate_fixture_working_file()

        self.assets = self.get("data/assets/all")
        self.assertEqual(len(self.assets), 3)

        api_path = "/import/shotgun/remove/asset"
        self.assets = self.post(api_path, {"id": sg_asset["id"]}, 200)

        self.assets = self.get("data/assets/all")
        self.assertEqual(len(self.assets), 3)

        asset = self.get("data/assets/%s" % asset["id"], 200)
        self.assertTrue(asset["canceled"])

    def test_remove_subasset(self):
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
        asset = self.assets[0]

        self.assets = self.get("data/assets/all")
        self.assertEqual(len(self.assets), 3)

        api_path = "/import/shotgun/remove/asset"
        self.assets = self.post(api_path, {"id": sg_asset["id"]}, 200)

        self.assets = self.get("data/assets/all")
        self.assertEqual(len(self.assets), 2)

        self.get("data/assets/%s" % asset["id"], 404)
