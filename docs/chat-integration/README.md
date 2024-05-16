# Chat Integration

## Discord Integration

### Create a Bot Account

1. Ensure you're logged on to the [Discord website](https://discord.com/).
2. Navigate to the [application page](https://discord.com/developers/applications).
3. Click on the "New Application" button.
4. Give the application a name (for example, "Kitsu") and click "Create".

![Create application](../img/discord/create_application.png)

5. Create a Bot User by navigating to the “Bot” tab and clicking “Add Bot”.
    - Click “Yes, do it!” to continue.

![Create bot](../img/discord/create_bot_user.png)

6. You can add an icon for the bot by clicking the icon next to "Username".
It will be the same icon used when the bot chats.

7. Make sure that Public Bot is ticked if you want others to invite your bot.

![Public Bot ticked](../img/discord/public_bot.png)

8. Make sure the server members' intent is ticked to allow the bot to see other members.

![Server Members Intent ticked](../img/discord/server_members_intent.png)

9. Copy the token using the "Copy" button. 

10. Copy the token in Kitsu's "Settings" and enter it in the text field "Discord token (optional)" before clicking on "Save settings."

![Add discord token to settings](../img/discord/add_discord_token_settings.png)

### Inviting your Bot

So you’ve made a Bot User, but it’s not on any server.

To add the bot to a server, follow these steps:

1. Ensure you're logged on to the [Discord website](https://discord.com/).
2. Navigate to the [application page](https://discord.com/developers/applications).
3. Click on your bot’s page.
4. Go to the “OAuth2” tab and after "URL Generator".
5. In "Scopes", tick only "bot".

![URL Generator Scopes](../img/discord/url_generator_scopes.png)

6. In "Bot permissions," tick only "Send Messages".

![URL Generator Bot permissions](../img/discord/bot_permissions.png)

7. The resulting URL can be used to add your bot to a server. Copy and paste the URL into your browser, choose a server to invite the bot to, and click “Authorize”.

> **_Note:_** To add the bot, the person needs “Manage Server” permissions.

> **_Note:_** The users who want notifications enabled have to be on the same server as the bot.

### Enable Discord Notifications

Each user can set in their Profile the notification push to
Discord. They have to switch the "Discord notifications enabled". 
Change the field to "Yes" and enter their "Discord username" (they're in the form username#number).

![Add discord username in profile](../img/discord/add_discord_username_profile.png)


You're done!

## Slack Integration

The Slack integration is tedious because it requires that you create a
dedicated application in your Slack space. But don't worry; we will explain the full
process in the following section!



### Create a Kitsu Application in Slack


To start with the integration, we need to create an application in Slack
dedicated to sending messages on your Kitsu instance behalf.

For that, let's connect to [https://api.slack.com/apps](https://api.slack.com/apps)

From here, click on the Create New App button:
![Application token](../img/slack/slack_create_app_01.png)



Then enter Kitsu as the name and choose the workspace you want to link with your Kitsu instance:
![Application token](../img/slack/slack_create_app_02.png)


### Set the Right Permissions

When the App is created, go to the app page by clicking on its name in the list
and go to the *Basic information* section. Then click on the *Permissions*
button on the bottom right:
![Application token](../img/slack/slack_create_app_03.png)


From there, go to the scopes section to add the required permission:
![Application token](../img/slack/slack_create_app_04.png)

The required permission scope is `chat:write:bot`:
![Application token](../img/slack/slack_create_app_05.png)


### Install the App in your Workspace

We can now proceed to the app installation in the workspace. Go to the
*Install App* section and proceed to installation by clicking on the big green
button:
![Application token](../img/slack/slack_create_app_06.png)

Confirm the installation:
![Application token](../img/slack/slack_create_app_07.png)

Your Kitsu Slack App is now up and running! You just need to link your Kitsu to the notifications sent to your Slack workspace.


### Get the Token

Now, come back to the *Install app* section. You should see the token to use to
link your Kitsu instance to Slack.

![Application token](../img/slack/slack_create_app_08.png)




### Link Kitsu to your new Slack Application

Now that you have a valid token for your Slack application go to the settings
page. There, you can give the token to your Kitsu instance.

![Application token](../img/slack/slack_kitsu_settings.png)

### Enable Slack Notifications in your Profile

The final step requires you to go to your profile section. From there, you can turn on
your Slack notifications. It requires a last parameter: the Member ID you use
on your Slack.

You can find it in your Slack profile by clicking on More:

![Application token](../img/slack/slack_display_name1.png)

![Application token](../img/slack/slack_display_name2.png)

Then, In your Kitsu profile, set the Slack notifications on and the Slack
nickname:
![Application token](../img/slack/slack_configuration.png)

You can now enjoy pretty notifications right in your Slack workspace!

![Application token](../img/slack/slack_kitsu_notifications.png)


## Mattermost Integration

### Enable Incoming Webhooks, Custom Username, and Profile Picture for Webhooks

1. Ensure you are logged as a system admin account in your Mattermost server.
2. You need to check if your Mattermost installation can receive incoming webhooks and set a custom username and profile picture for webhooks. 
   1. Go to the "System Console" --> "Integrations" --> "Integration Management".
   
   ![Integration management](../img/mattermost/integration-management.png)
   
   2. Check if the parameters "Enable incoming Webhooks", "Enable integrations to override usernames" and "Enable integrations to override profile picture icons" are set to true (if not, set them to true).

   ![Enable incoming webhooks](../img/mattermost/enable-incoming-webhooks.png)

### Set a Webhook in Mattermost

1. Ensure you are logged as a system admin account in your Mattermost server.
2. Go to the "Integrations" --> "Incoming Webhooks" --> "Add incoming Webhook" section.

   ![Add incoming webhook](../img/mattermost/add-incoming-webhook.png)

3. Create the incoming webhook :

   ![Create incoming webhook](../img/mattermost/create-incoming-webhook.png)

* **Title**: Kitsu
* **Description**: Kitsu
* **Channel**: You can create a channel or use any existing ones because the message will be sent to a user. 
* **Lock to this channel**: It must be set to False.
* **Username**: kitsu / Not important; it will be overridden by Kitsu.
* **Profile Picture**: Not important; it will be overridden by Kitsu.

4. After clicking "save", Mattermost proposes a new URL you must copy.

5. Copy that URL in the "Settings" of Kitsu and the text field "Mattermost Webhooks (optional)" and click on "Save settings".

   ![Add mattermost webhook settings](../img/mattermost/add_mattermost_webhook_settings.png)

> **_Note:_** The users who want notifications enabled have to be on the same Mattermost server as the one you use in these steps.

### Enable Mattermost Notifications

Each user can set in their profile the notification push to
Discord. They have to switch the "Mattermost notifications enabled" 
field to "Yes" and enter their "Mattermost username".

![Add Mattermost username in profile](../img/mattermost/add_mattermost_username_profile.png)


You're done!
