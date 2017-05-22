import os

from zou.app import app
from zou.app.utils import fs

from PIL import Image

RECTANGLE_SIZE = 150, 100
SQUARE_SIZE = 100, 100


def save_file(data_type, instance_id, file_to_save, size=RECTANGLE_SIZE):
    file_name = get_file_name(instance_id)
    thumbnail_folder = create_type_folder(data_type)

    file_path = os.path.join(thumbnail_folder, file_name)
    file_to_save.save(file_path)
    turn_into_thumbnail(file_path, size=size)

    return file_path


def get_file_name(instance_id):
    return "%s.png" % instance_id


def get_full_path(data_type, instance_id):
    return os.path.join(get_folder_name(data_type), get_file_name(instance_id))


def get_folder_name(data_type):
    thumbnail_folder = app.config["THUMBNAIL_FOLDER"]
    return os.path.join(thumbnail_folder, data_type)


def create_type_folder(data_type):
    thumbnail_folder = get_folder_name(data_type)
    fs.mkdir_p(thumbnail_folder)
    return thumbnail_folder


def turn_into_thumbnail(file_path, size=RECTANGLE_SIZE):
    im = Image.open(file_path)
    im = im.resize(size)
    im.save(file_path)


def url_path(data_type, instance_id):
    data_type = data_type.replace("_", "-")
    return "thumbnails/%s/%s.png" % (data_type, instance_id)
