from slugify import slugify
from zou.app.blueprints.source.csv.base import BaseCsvProjectImportResource

from zou.app.services import assets_service, shots_service, breakdown_service


class CastingCsvImportResource(BaseCsvProjectImportResource):
    def prepare_import(self, project_id):
        self.asset_type_map = {}
        self.asset_map = {}
        self.episode_map = {}
        self.sequence_map = {}
        self.shot_map = {}

        asset_types = assets_service.get_asset_types()
        for asset_type in asset_types:
            self.asset_type_map[asset_type["id"]] = slugify(asset_type["name"])

        assets = assets_service.get_assets({"project_id": project_id})
        for asset in assets:
            key = self.get_asset_key(asset)
            self.asset_map[key] = asset["id"]

        episodes = shots_service.get_episodes({"project_id": project_id})
        for episode in episodes:
            self.episode_map[episode["id"]] = slugify(episode["name"])

        sequences = shots_service.get_sequences({"project_id": project_id})
        for sequence in sequences:
            key = self.get_sequence_key(sequence)
            self.sequence_map[sequence["id"]] = key

        shots = shots_service.get_shots({"project_id": project_id})
        for shot in shots:
            key = self.get_shot_key(shot)
            self.shot_map[key] = shot["id"]

    def get_asset_key(self, asset):
        asset_type_name = self.asset_type_map[asset["entity_type_id"]]
        return "%s%s" % (asset_type_name, slugify(asset["name"]))

    def get_sequence_key(self, sequence):
        episode_name = ""
        if sequence["parent_id"] in self.episode_map:
            episode_name = self.episode_map[sequence["parent_id"]]
        return "%s%s" % (episode_name, slugify(sequence["name"]))

    def get_shot_key(self, shot):
        sequence_key = self.sequence_map[shot["parent_id"]]
        return "%s%s" % (sequence_key, slugify(shot["name"]))

    def import_row(self, row, project_id):
        asset_key = slugify("%s%s" % (row["Asset Type"], row["Asset"]))
        target_key = slugify(
            "%s%s%s" % (row["Episode"], row["Parent"], row["Name"])
        )
        occurences = 1
        if len(row["Occurences"]) > 0:
            occurences = int(row["Occurences"])
        label = slugify(row["Label"])

        asset_id = self.asset_map.get(asset_key, None)
        target_id = self.shot_map.get(target_key, None)
        if target_id is None:
            target_id = self.asset_map.get(target_key, None)

        if asset_id is not None and target_id is not None:
            breakdown_service.create_casting_link(
                target_id, asset_id, occurences, label
            )
