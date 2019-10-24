from flask_mail import Message

from zou.app import mail


def send_email(subject, body, recipient_email):
    """
    Send an email with given subject and body to given recipient.
    """
    message = Message(body=body, subject=subject, recipients=[recipient_email])
    mail.send(message)
