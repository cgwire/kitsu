import subprocess


def get_git_revision_hash():
    return subprocess.check_output(["git", "rev-parse", "HEAD"])
