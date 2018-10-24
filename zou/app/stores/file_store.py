import os
import io
import flask_fs as fs

from flask_fs.backends.local import LocalBackend
from flask_fs.backends.swift import SwiftBackend

from zou.app import app


def read(self, filename):
    with self.open(filename, 'rb') as f:
        return f.read()


def path(self, filename):
    folder_one = filename.split("-")[0]
    file_name = "-".join(filename.split("-")[1:])
    folder_two = file_name[:3]
    folder_three = file_name[3:6]

    path = os.path.join(
        self.root,
        folder_one,
        folder_two,
        folder_three,
        file_name
    )
    return path


def init_swift(self, name, config):
    """
    Hack needed because Flask FS backend supports only swift 1.0 authentication.
    """
    import swiftclient
    super(SwiftBackend, self).__init__(name, config)

    self.conn = swiftclient.Connection(
        user=config.user,
        key=config.key,
        authurl=config.authurl,
        auth_version="2.0",
        os_options={
            "tenant_name": config.tenant_name,
            "region_name": config.region_name
        }
    )
    self.conn.put_container(self.name)


def clear_bucket(bucket):
    for filename in bucket.list_files():
        os.remove(os.path.join(bucket.root, filename))


LocalBackend.read = read
LocalBackend.path = path
SwiftBackend.__init__ = init_swift


def make_key(prefix, id):
    return "%s-%s" % (prefix, id)


def make_read_generator(bucket, key):
    read_stream = bucket.read(key)

    def read_generator(read_stream):
        for chunk in io.BytesIO(read_stream):
            yield chunk

    return read_generator(read_stream)


def make_storage(bucket):
    return fs.Storage(
        "%s%s" % (app.config.get("FS_BUCKET_PREFIX", ""), bucket),
        overwrite=True
    )


pictures = make_storage("pictures")
movies = make_storage("movies")
files = make_storage("files")

pictures.configure(app)
movies.configure(app)
files.configure(app)


def clear():
    clear_bucket(pictures)
    clear_bucket(movies)
    clear_bucket(files)


def add_picture(prefix, id, path):
    key = make_key(prefix, id)
    with open(path, 'rb') as fd:
        return pictures.write(key, fd)


def get_picture(prefix, id):
    key = make_key(prefix, id)
    return pictures.read(key)


def open_picture(prefix, id):
    key = make_key(prefix, id)
    return make_read_generator(pictures, key)


def read_picture(prefix, id):
    key = make_key(prefix, id)
    return pictures.read(key)


def exists_picture(prefix, id):
    key = make_key(prefix, id)
    return pictures.exists(key)


def remove_picture(prefix, id):
    key = make_key(prefix, id)
    pictures.delete(key)


def get_local_picture_path(prefix, id):
    return path(pictures, make_key(prefix, id))


def add_movie(prefix, id, path):
    key = make_key(prefix, id)
    with open(path, 'rb') as fd:
        return movies.write(key, fd)


def get_movie(prefix, id):
    key = make_key(prefix, id)
    return movies.read(key)


def open_movie(prefix, id):
    key = make_key(prefix, id)
    return make_read_generator(movies, key)


def read_movie(prefix, id):
    key = make_key(prefix, id)
    return movies.read(key)


def exists_movie(prefix, id):
    key = make_key(prefix, id)
    return movies.exists(key)


def remove_movie(prefix, id):
    key = make_key(prefix, id)
    movies.delete(key)


def get_local_movie_path(prefix, id):
    return path(movies, make_key(prefix, id))


def add_file(prefix, id, path):
    key = make_key(prefix, id)
    with open(path, 'rb') as fd:
        return files.write(key, fd)


def get_file(prefix, id):
    key = make_key(prefix, id)
    return files.read(key)


def open_file(prefix, id):
    key = make_key(prefix, id)
    return make_read_generator(files, key)


def read_file(prefix, id):
    key = make_key(prefix, id)
    return files.read(key)


def exists_file(prefix, id):
    key = make_key(prefix, id)
    return files.exists(key)


def remove_file(prefix, id):
    key = make_key(prefix, id)
    files.delete(key)


def get_local_file_path(prefix, id):
    return path(files, make_key(prefix, id))
