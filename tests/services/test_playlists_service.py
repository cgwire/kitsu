from tests.base import ApiDBTestCase

from zou.app.models.playlist import Playlist
from zou.app.services import (
    files_service,
    playlists_service,
    tasks_service
)


class PlaylistsServiceTestCase(ApiDBTestCase):

    def setUp(self):
        super(PlaylistsServiceTestCase, self).setUp()

        self.generate_fixture_project_status()
        self.generate_fixture_project_standard()
        self.generate_fixture_project()
        self.generate_fixture_asset_type()
        self.generate_fixture_asset()
        self.episode_2 = self.generate_fixture_episode("E02")
        self.generate_fixture_episode()
        self.generate_fixture_sequence()
        self.generate_fixture_shot()
        self.sequence_dict = self.sequence.serialize()
        self.project_dict = self.sequence.serialize()

    def generate_fixture_playlist(self):
        Playlist.create(
            name="Playlist 1",
            shots={},
            project_id=self.project.id,
            episode_id=self.episode.id
        )
        Playlist.create(
            name="Playlist 2",
            shots={},
            project_id=self.project_standard.id
        )
        Playlist.create(
            name="Playlist 3",
            shots={},
            project_id=self.project.id,
            episode_id=self.episode_2.id
        )
        self.playlist = Playlist.create(
            name="Playlist 4",
            shots={},
            project_id=self.project.id,
            episode_id=self.episode_2.id
        )
        return self.playlist.serialize()

    def test_get_playlists_for_project(self):
        self.generate_fixture_playlist()
        playlists = playlists_service.all_playlists_for_project(self.project.id)
        self.assertEqual(len(playlists), 3)
        self.assertTrue(
            "Playlist 2" not in [
                playlists[0]["name"], playlists[1]["name"], playlists[2]["name"]
            ]
        )
        self.playlist.update({"for_client": True})
        playlists = playlists_service.all_playlists_for_project(
            self.project.id, True
        )
        self.assertEqual(len(playlists), 1)

    def test_get_playlist_for_episode(self):
        self.generate_fixture_playlist()
        playlists = playlists_service.all_playlists_for_episode(
            self.episode_2.id)
        self.assertEqual(len(playlists), 2)
        self.assertEqual(playlists[0]["name"], "Playlist 3")
        self.playlist.update({"for_client": True})
        playlists = playlists_service.all_playlists_for_project(
            self.project.id, True
        )
        self.assertEqual(len(playlists), 1)

    """
    def test_get_playlist(self):
    def test_retrieve_playlist_tmp_files(self):
    def test_get_playlist_with_preview_file_revisions(self):
    def test_set_preview_files_for_shots(self):
    def test_build_playlist_zip_file(self):
    def test_build_playlist_movie_file(self):
    def test_start_build_job(self):
    def test_end_build_job(self):
    def test_build_playlist_job(self):
    def test_get_playlist_file_name(self):
    def test_get_playlist_movie_file_path(self):
    def test_get_playlist_zip_file_path(self):
    def test_get_build_job(self):
    def test_remove_build_job(self):
    """
