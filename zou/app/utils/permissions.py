from flask_principal import RoleNeed, Permission

admin_permission = Permission(RoleNeed('admin'))
manager_permission = Permission(RoleNeed('manager'))


class PermissionDenied(Exception):
    pass


def check_manager_permissions():
    if admin_permission.can() and manager_permission.can():
        return True
    else:
        raise PermissionDenied


def check_admin_permissions():
    if admin_permission.can():
        return True
    else:
        raise PermissionDenied
