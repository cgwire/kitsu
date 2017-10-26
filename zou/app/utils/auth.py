import flask_bcrypt as bcrypt
import email_validator


class PasswordTooShortException(BaseException):
    pass


class PasswordsNoMatchException(BaseException):
    pass


class EmailNotValidException(BaseException):
    pass


def encrypt_password(password):
    """
    Encrypt given string password using bcrypt algorithm.
    """
    return bcrypt.generate_password_hash(password)


def validate_email(email):
    try:
        return email_validator.validate_email(email)["email"]
    except email_validator.EmailNotValidError as e:
        raise EmailNotValidException(str(e))


def validate_password(password, password_2):
    if len(password) < 6:
        raise PasswordTooShortException()
    if password != password_2:
        raise PasswordsNoMatchException()
    return True
