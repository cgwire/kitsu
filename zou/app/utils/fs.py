import os
import shutil

import errno


def mkdir_p(path):
    try:
        os.makedirs(path)
    except OSError as exception:
        if exception.errno == errno.EEXIST and os.path.isdir(path):
            pass
        else:
            raise


def rm_rf(path):
    if os.path.exists(path):
        shutil.rmtree(path)


def rm_file(path):
    if os.path.exists(path):
        os.remove(path)


def copyfile(src, dest):
    shutil.copyfile(src, dest)


def get_file_path(
    config, get_local_path, open_file, prefix, instance_id, extension
):
    if config.FS_BACKEND == "local":
        file_path = get_local_path(prefix, instance_id)
    else:
        file_path = os.path.join(
            config.TMP_DIR, "cache-%s-%s.%s" % (prefix, instance_id, extension)
        )
        if not os.path.exists(file_path) or os.path.getsize(file_path) == 0:
            with open(file_path, "wb") as tmp_file:
                for chunk in open_file(prefix, instance_id):
                    tmp_file.write(chunk)
    return file_path
