import os
import shutil
import math

from zou.app.utils import fs

from PIL import Image

RECTANGLE_SIZE = 150, 100
SQUARE_SIZE = 100, 100
PREVIEW_SIZE = 1200, 0
BIG_SQUARE_SIZE = 400, 400


def save_file(tmp_folder, instance_id, file_to_save):
    """
    Save file in given folder. The file must only be temporary saved via
    this function.
    """
    extension = "." + file_to_save.filename.split(".")[-1].lower()
    file_name = instance_id + extension.lower()
    file_path = os.path.join(tmp_folder, file_name)
    file_to_save.save(file_path)
    return file_path

def convert_jpg_to_png(file_source_path):

    """
    Convert .jpg file located at given path into a .png file with same name.
    """
    folder_path = os.path.dirname(file_source_path)
    file_source_name = os.path.basename(file_source_path)
    file_target_name = "%s.png" % file_source_name[:-4]
    file_target_path = os.path.join(folder_path, file_target_name)

    im = Image.open(file_source_path)
    im.save(file_target_path, "PNG")
    fs.rm_file(file_source_path)
    return file_target_path


def get_file_name(instance_id):
    """
    Build thumbnail file name for given id.
    """
    return "%s.png" % instance_id


def get_full_size_from_width(im, width):
    """
    From given width/g
    """
    im_width, im_height = im.size
    ratio = float(im_height) / float(im_width)
    height = int(math.ceil(width * ratio))
    return (width, height)


def turn_into_thumbnail(file_path, size=None):
    """
    Turn given picture into a smaller version.
    """
    im = Image.open(file_path)

    if size is not None:
        (width, height) = size

        if height == 0:
            size = get_full_size_from_width(im, width)
        else:
            im = prepare_image_for_thumbnail(im, size)
    else:
        size = im.size

    im = im.resize(size, Image.LANCZOS)
    im.save(file_path)
    return file_path


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


def generate_preview_variants(original_path, instance_id):
    """
    Generate three thumbnails for given picture path.

    1. Rectangle thumbnail
    2. Square thumbnail
    3. Big rectangle thumbnail
    """
    file_name = get_file_name(instance_id)
    variants = [
        ("thumbnails", RECTANGLE_SIZE),
        ("thumbnails-square", SQUARE_SIZE),
        ("previews", PREVIEW_SIZE)
    ]

    result = []
    for picture_data in variants:
        (picture_type, size) = picture_data
        folder_path = os.path.dirname(original_path)
        picture_path = os.path.join(
            folder_path,
            "%s-%s" % (picture_type, file_name)
        )
        shutil.copyfile(original_path, picture_path)
        turn_into_thumbnail(picture_path, size)
        result.append((picture_type, picture_path))
    return result


def url_path(data_type, instance_id):
    """
    Build thumbnail download path for given data type and instance ID.
    """
    data_type = data_type.replace("_", "-")
    return "pictures/thumbnails/%s/%s.png" % (data_type, instance_id)


def flat(*nums):
    """
    Turn into an int tuple an a enumerable of numbers.
    """
    return tuple(int(round(n)) for n in nums)
