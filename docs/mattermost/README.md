# Mattermost Integration

## Enable custom username and profile picture for webhooks

This step requires a system admin account.
First, you need to check if your Mattermost installation can set custom username and profile picture for webhooks.
Go to the "System Console" / "Integrations" / "Integration Management" and check if the parameters "Enable integrations to override usernames" and "Enable integrations to override profile picture icons" are set to true (if not set them to true).

## Set a webhook in Mattermost

This step requires a system admin account.
Go to the "Integrations" / "Incoming Webhooks" / "Add incoming Webhook" section and
create a new webhook with the following parameters:

* **Title**: Kitsu
* **Description**: Kitsu
* **Channel**: You can create a channel or use any of existing ones because the message will be sent to a given user. 
* **Lock to this channel**: It must be set to False.
* **Username**: kitsu / Not important it will be overridden by Kitsu.
* **Profile Picture**: Not important it will be overridden by Kitsu.

Mattermost proposes you a new URL that you must copy.

## Configure Kitsu

Paste the URL generated in Mattermost into the *Organisation settings* page of
the Kitsu UI inside the "Mattermost Webhook (Optional)" field.

Once done, each user can set in their profiles the notification push to
Mattermost. They have to switch the "Mattermost notifications Enabled" 
field to "Yes" and enter their "Mattermost Username". 

You're done!
