from slackclient import SlackClient


def send_to_slack(app_token, userid, message):
    client = SlackClient(token=app_token)
    client.api_call(
        'chat.postMessage',
        channel="@%s" % userid,
        text=message,
        as_user=True
    )
    return True
