from flask_principal import RoleNeed, Permission
from werkzeug.exceptions import Forbidden

admin_permission = Permission(RoleNeed('admin'))
manager_permission = Permission(RoleNeed('manager'))


class PermissionDenied(Forbidden):
    pass


def has_manager_permissions():
    return admin_permission.can() or manager_permission.can()


def check_manager_permissions():
    if has_manager_permissions():
        return True
    else:
        raise PermissionDenied


def check_admin_permissions():
    if admin_permission.can():
        return True
    else:
        raise PermissionDenied
