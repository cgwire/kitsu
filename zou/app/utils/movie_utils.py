import os
import math
import ffmpeg
from PIL import Image


def save_file(tmp_folder, instance_id, file_to_save):
    """
    Save given file in given path. This function should only be used for
    temporary storage.
    """
    extension = file_to_save.filename[-4:]
    file_name = instance_id + extension.lower() + ".tmp"
    file_path = os.path.join(tmp_folder, file_name)
    file_to_save.save(file_path)
    return file_path


def generate_thumbnail(movie_path):
    """
    Generate a thumbnail to represent the movie given at movie path. It
    takes a picture at the first frame of the movie.
    """
    folder_path = os.path.dirname(movie_path)
    file_source_name = os.path.basename(movie_path)
    file_target_name = "%s.png" % file_source_name[:-4]
    file_target_path = os.path.join(folder_path, file_target_name)

    ffmpeg \
        .input(movie_path, ss="00:00:00") \
        .output(file_target_path, vframes=1) \
        .run(
            quiet=True
        )
    return file_target_path


def get_movie_size(movie_path):
    """
    Returns movie resolution (extract a frame and returns its size).
    """
    image_path = generate_thumbnail(movie_path)
    im = Image.open(image_path)
    im.close()
    return im.size


def normalize_movie(movie_path, fps="24.00"):
    """
    Turn movie in a 1080p movie file.
    """
    folder_path = os.path.dirname(movie_path)
    file_source_name = os.path.basename(movie_path)
    file_target_name = "%s.mp4" % file_source_name[:-8]
    file_target_path = os.path.join(folder_path, file_target_name)

    (width, h) = get_movie_size(movie_path)
    resize_factor = width / h
    height = 1080
    width = math.floor(resize_factor * height)
    if width % 2 == 1:
        width = width + 1

    try:
        ffmpeg \
            .input(movie_path) \
            .output(
            file_target_path,
            pix_fmt='yuv420p',
            format="mp4",
            r=fps,
            b="28M",
            preset="medium",
            vcodec="libx264",
            s="%sx%s" % (width, height)
            ) \
            .run(
                quiet=False,
                capture_stderr=True
            )
    except ffmpeg.Error as exc:
        from flask import current_app
        current_app.logger.error(exc.stderr)
        raise

    return file_target_path


def build_playlist_movie(tmp_file_paths, movie_file_path, fps="24.00"):
    in_files = []
    if len(tmp_file_paths) > 0:
        (first_movie_file_path, _) = tmp_file_paths[0]
        (width, height) = get_movie_size(first_movie_file_path)

        for tmp_file_path, file_name in tmp_file_paths:
            in_file = ffmpeg.input(tmp_file_path)
            in_files.append(in_file)

        try:
            ffmpeg \
                .concat(*in_files) \
                .output(
                    movie_file_path,
                    pix_fmt='yuv420p',
                    format="mp4",
                    r=fps,
                    b="28M",
                    preset="medium",
                    vcodec="libx264",
                    s="%sx%s" % (width, height)
                ) \
                .overwrite_output() \
                .run()
        except Exception as e:
            print(e)
    return movie_file_path
