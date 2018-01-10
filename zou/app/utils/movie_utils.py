from moviepy.editor import VideoFileClip


def generate_thumbnail(movie_clip, thumbnail_path):
    movie_clip.save_frame(thumbnail_path, round(movie_clip.duration / 2))


def normalize_movie(movie_path, thumbnail_path=None):
    movie_clip = VideoFileClip(movie_path + '.tmp')
    movie_clip = movie_clip.resize(height=720)

    if thumbnail_path is not None:
        generate_thumbnail(movie_clip, thumbnail_path)

    movie_clip.write_videofile(movie_path)
