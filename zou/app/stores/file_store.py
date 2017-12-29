import flask_fs as fs

from zou.app import app


pictures = fs.Storage("pictures", overwrite=True)
movies = fs.Storage("movies", overwrite=True)

pictures.configure(app)
movies.configure(app)


def make_key(prefix, id):
    return "%s-%s" % (prefix, id)


def add_picture(prefix, id, path):
    key = make_key(prefix, id)
    with open(path, 'rb') as fd:
        return pictures.write(key, fd)


def get_picture(prefix, id):
    key = make_key(prefix, id)
    return pictures.read(key)


def open_picture(prefix, id):
    key = make_key(prefix, id)
    return pictures.open(key, 'rb')


def exists_picture(prefix, id):
    key = make_key(prefix, id)
    return pictures.exists(key)


def remove_picture(prefix, id):
    key = make_key(prefix, id)
    pictures.delete(key)


def add_movie(prefix, id, content):
    key = make_key(prefix, id)
    return movies.write(key, content)


def get_movie(prefix, id):
    key = make_key(prefix, id)
    return movies.read(key)


def open_movie(prefix, id):
    key = make_key(prefix, id)
    return movies.open(key, 'rb')


def exists_movie(prefix, id):
    key = make_key(prefix, id)
    return movies.exists(key)


def remove_movie(prefix, id):
    key = make_key(prefix, id)
    movies.delete(key)
