# Mattermost Integration


## Create a Kitsu user in Mattermost

First, you need to create in Mattermost a User, for example *Kitsu*. Then gives
it the *Team Admin* privilege, to allow it to set a webhook.

## Create a channel for the notifications in Mattermost

Then to be able to send notifications to users, we have to create a dedicated
channel. Let's name it *Kitsu*. 

## Set the webhook in mattermost

Connect in Mattermost with the user account "Kitsu". Go to the 
"Integrations" / "Incoming Webhooks" / "Add incoming Webhook" section and
create a new webhook with the following parameters:

* **Title**: Kitsu
* **Channel**: Kitsu (created before)
* **Username**: Kitsu

Mattermost proposes you a new URL that you must copy.

## Configure Kitsu

Paste the URL generated in Mattermost into the *Organisation settings* page of
the Kitsu UI inside the "Mattermost Webhook (Optional)" field.

Once done, each user can set in his/her profile the notification push to
Mattermost. They have to switch the "Mattermost notifications Enabled" 
field to "Yes" and enter their "Mattermost Username". 

You're done!
