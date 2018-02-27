import os
import flask_fs as fs

from flask_fs.backends.local import LocalBackend

from zou.app import app



def read(self, filename):
    print("read", filename)
    with self.open(filename, 'rb') as f:
        return f.read()

def path(self, filename):
    print("pathhhh", filename)
    folder_one = filename.split("-")[0]
    file_name = "-".join(filename.split("-")[1:])
    folder_two = file_name[:3]

    path = os.path.join(
        self.root,
        "preview-files",
        folder_one,
        folder_two,
        file_name
    )
    if os.path.exists(path + ".mp4"):
        path += ".mp4"
    else:
        path += ".png"
    print("pathhhh computed", path)
    return path

LocalBackend.read = read
LocalBackend.path = path

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


def add_movie(prefix, id, path):
    key = make_key(prefix, id)
    with open(path, 'rb') as fd:
        return movies.write(key, fd)


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
