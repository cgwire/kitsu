from slackclient import SlackClient


def send_to_slack(app_token, userid, message):
    client = SlackClient(token=app_token)
    blocks = [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text":  message,
            }
        },
    ]
    client.api_call(
        "chat.postMessage", channel="@%s" % userid, blocks=blocks, as_user=True
    )
    return True
