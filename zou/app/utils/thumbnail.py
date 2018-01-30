import os
import shutil
import math

from zou.app import app
from zou.app.utils import fs

from PIL import Image

RECTANGLE_SIZE = 150, 100
SQUARE_SIZE = 100, 100
PREVIEW_SIZE = 1200, 0
BIG_SQUARE_SIZE = 400, 400


def save_file(subfolder, instance_id, file_to_save, size=None):
    extension = file_to_save.filename[-4:]
    file_name = instance_id + extension
    thumbnail_folder = create_folder(subfolder)

    file_path = os.path.join(thumbnail_folder, file_name)
    file_to_save.save(file_path)

    if size is not None:
        turn_into_thumbnail(file_path, size=size)

    return file_path


def convert_jpg_to_png(subfolder, instance_id):
    file_source_name = "%s.jpg" % instance_id
    file_target_name = "%s.png" % instance_id
    thumbnail_folder = create_folder(subfolder)
    file_source_path = os.path.join(thumbnail_folder, file_source_name)
    file_target_path = os.path.join(thumbnail_folder, file_target_name)

    im = Image.open(file_source_path)
    im.save(file_target_path)
    fs.rm_file(file_source_path)
    return file_target_path


def get_file_name(instance_id):
    return "%s.png" % instance_id


def get_file_path(subfolder, instance_id):
    return os.path.join(get_folder_name(subfolder), get_file_name(instance_id))


def get_folder_name(subfolder):
    thumbnail_folder = app.config["THUMBNAIL_FOLDER"]
    return os.path.join(thumbnail_folder, subfolder)


def get_preview_folder_name(subfolder, instance_id):
    thumbnail_folder = app.config["THUMBNAIL_FOLDER"]
    subfolder = os.path.join(
        "preview-files",
        subfolder,
        instance_id.split("-")[0][:3]
    )

    return os.path.join(thumbnail_folder, subfolder)


def get_preview_file_path(subfolder, instance_id):
    return os.path.join(
        get_preview_folder_name("originals", instance_id),
        get_file_name(instance_id)
    )


def create_folder(subfolder):
    thumbnail_folder = get_folder_name(subfolder)
    fs.mkdir_p(thumbnail_folder)
    return thumbnail_folder


def flat(*nums):
    return tuple(int(round(n)) for n in nums)


def get_image_size(file_path):
    im = Image.open(file_path)
    return im.size


def get_full_size_from_width(im, width):
    im_width, im_height = im.size
    ratio = float(im_height) / float(im_width)
    height = int(math.ceil(width * ratio))
    return (width, height)


def turn_into_thumbnail(file_path, size=None):
    im = Image.open(file_path)

    if size is not None:
        (width, height) = size

        if height == 0:
            size = get_full_size_from_width(im, width)
        else:
            im = prepare_image_for_thumbnail(im, size)
    else:
        size = im.size

    im = im.resize(size)
    im.save(file_path)


def prepare_image_for_thumbnail(im, size):
    """
    Crop image to avoid deformation while building the target thumbnail.
    """

    im_width, im_height = im.size
    width, height = size
    original_ratio = float(im_width) / float(im_height)
    target_ratio = float(width) / float(height)
    if target_ratio > original_ratio:
        # image is too tall: take some off the top and bottom
        scale_factor = float(target_ratio) / float(original_ratio)
        crop_width = im_width
        crop_height = math.floor(float(im_height) / scale_factor)
        top_cut_line = (im_height - crop_height) / 2
        im = im.crop(flat(
            0,
            top_cut_line,
            crop_width,
            top_cut_line + crop_height
        ))
    else:
        # image is too wide: take some off the sides
        scale_factor = float(original_ratio) / float(target_ratio)
        crop_width = math.ceil(float(im_width) / scale_factor)
        crop_height = im_height
        side_cut_line = int(float(im_width - crop_width) / 2)
        im = im.crop(flat(
            side_cut_line,
            0,
            side_cut_line + crop_width,
            crop_height
        ))
    return im


def url_path(data_type, instance_id):
    data_type = data_type.replace("_", "-")
    return "pictures/thumbnails/%s/%s.png" % (data_type, instance_id)


def generate_preview_variants(instance_id):
    file_name = get_file_name(instance_id)
    original_path = get_preview_file_path("originals", instance_id)
    variants = [
        ("thumbnails", RECTANGLE_SIZE),
        ("thumbnails-square", SQUARE_SIZE),
        ("previews", PREVIEW_SIZE)
    ]

    for picture_data in variants:
        (picture_type, size) = picture_data
        folder_path = get_preview_folder_name(picture_type, instance_id)
        full_folder_path = create_folder(folder_path)
        picture_path = os.path.join(full_folder_path, file_name)
        shutil.copyfile(original_path, picture_path)
        turn_into_thumbnail(picture_path, size)


def get_preview_url_path(instance_id):
    file_name = get_file_name(instance_id)
    return {
        "original": "/api/pictures/originals/preview-files/%s" % file_name,
        "thumbnail": "/api/pictures/thumbnails/preview-files/%s" % file_name,
        "thumbnail_square":
            "/api/pictures/thumbnails-square/preview-files/%s" % file_name,
        "previews": "/api/pictures/previews/preview-files/%s" % file_name
    }
