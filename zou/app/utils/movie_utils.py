import os

from moviepy.editor import VideoFileClip


def save_file(tmp_folder, instance_id, file_to_save):
    extension = file_to_save.filename[-4:]
    file_name = instance_id + extension.lower() + ".tmp"
    file_path = os.path.join(tmp_folder, file_name)
    file_to_save.save(file_path)
    return file_path


def generate_thumbnail(movie_path):
    folder_path = os.path.dirname(movie_path)
    file_source_name = os.path.basename(movie_path)
    file_target_name = "%s.png" % file_source_name[:-4]
    file_target_path = os.path.join(folder_path, file_target_name)

    movie_clip = VideoFileClip(movie_path)
    movie_clip.save_frame(file_target_path, round(movie_clip.duration / 2))
    return file_target_path


def normalize_movie(movie_path):
    folder_path = os.path.dirname(movie_path)
    file_source_name = os.path.basename(movie_path)
    file_target_name = "%s.mp4" % file_source_name[:-8]
    file_target_path = os.path.join(folder_path, file_target_name)
    print("normalize_movie", movie_path, file_target_path)

    movie_clip = VideoFileClip(movie_path)
    movie_clip = movie_clip.resize(height=720)
    movie_clip.write_videofile(file_target_path)
    return file_target_path
