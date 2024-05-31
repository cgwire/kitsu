# Chat Integration

## Discord Integration

### Create a Bot Account

1. Ensure you're logged on to the [Discord website](https://discord.com/).
2. Navigate to the [application page](https://discord.com/developers/applications).
3. Click on the "New Application" button.
4. Give the application a name (for example, "Kitsu") and click "Create".

![Create application](../img/discord/create_application.png)

5. Create a Bot User by navigating to the "Bot" tab and clicking "Add Bot".
    - Click "Yes, do it!" to continue.

![Create bot](../img/discord/create_bot_user.png)

6. You can add an icon for the bot by clicking the icon next to "Username". This icon will be used when the bot chats.

7. Ensure that "Public Bot" is ticked if you want others to invite your bot.

![Public Bot ticked](../img/discord/public_bot.png)

8. Ensure the "Server Members Intent" is ticked to allow the bot to see other members.

![Server Members Intent ticked](../img/discord/server_members_intent.png)

9. Copy the token using the "Copy" button. 

10. Paste the token in Kitsu's "Settings" under the text field "Discord token (optional)" and click "Save settings".

![Add discord token to settings](../img/discord/add_discord_token_settings.png)

### Inviting Your Bot

Now that you've created a Bot User, you need to add it to a server. Follow these steps:

1. Ensure you're logged on to the [Discord website](https://discord.com/).
2. Navigate to the [application page](https://discord.com/developers/applications).
3. Click on your bot’s page.
4. Go to the "OAuth2" tab and then to "URL Generator".
5. In "Scopes", tick "bot" only.

![URL Generator Scopes](../img/discord/url_generator_scopes.png)

6. In "Bot Permissions", tick "Send Messages" only.

![URL Generator Bot permissions](../img/discord/bot_permissions.png)

7. Use the resulting URL to add your bot to a server. Copy and paste the URL into your browser, choose a server to invite the bot to, and click "Authorize".

> **_Note:_** To add the bot, the person needs "Manage Server" permissions.

> **_Note:_** Users who want notifications enabled must be on the same server as the bot.

### Enable Discord Notifications

Each user can set notifications to be pushed to Discord in their profile. They need to switch "Discord notifications enabled" to "Yes" and enter their "Discord username" (formatted as username#number).

![Add discord username in profile](../img/discord/add_discord_username_profile.png)

You're done!

## Slack Integration

The Slack integration requires creating a dedicated application in your Slack space. The following steps will guide you through the process.

### Create a Kitsu Application in Slack

To start, connect to [https://api.slack.com/apps](https://api.slack.com/apps).

Click the "Create New App" button:

![Create new app](../img/slack/slack_create_app_01.png)

Enter "Kitsu" as the name and choose the workspace you want to link with your Kitsu instance:

![Choose workspace](../img/slack/slack_create_app_02.png)


### Set the Right Permissions

After creating the app, go to the app page by clicking on its name in the list. Go to the *Basic Information* section and click on the *Permissions* button at the bottom right:

![Permissions button](../img/slack/slack_create_app_03.png)

In the scopes section, add the required permission:

![Add scope](../img/slack/slack_create_app_04.png)

The required permission scope is `chat:write:bot`:

![Permission scope](../img/slack/slack_create_app_05.png)


### Install the App in Your Workspace

Proceed to the app installation in the workspace. Go to the *Install App* section and click on **Install App To Workspace** button to install:

![Install app](../img/slack/slack_create_app_06.png)

Confirm the installation:

![Confirm installation](../img/slack/slack_create_app_07.png)

Your Kitsu Slack App is now up and running! You just need to link your Kitsu to the notifications sent to your Slack workspace.

### Get the Token

Return to the *Install App* section. You should see the token needed to link your Kitsu instance to Slack:

![Get token](../img/slack/slack_create_app_08.png)

### Link Kitsu to Your New Slack Application

With your valid token, go to the settings page in Kitsu and enter the token:

![Add token in settings](../img/slack/slack_kitsu_settings.png)

### Enable Slack Notifications in Your Profile

Finally, go to your profile section to turn on Slack notifications. Enter the Member ID you use on Slack, which you can find in your Slack profile by clicking on "More":

![Find member ID](../img/slack/slack_display_name1.png)

![Member ID](../img/slack/slack_display_name2.png)

In your Kitsu profile, set the Slack notifications to "on" and enter your Slack nickname:

![Configure Slack notifications](../img/slack/slack_configuration.png)

You can now enjoy notifications directly in your Slack workspace!

![Slack notifications](../img/slack/slack_kitsu_notifications.png)

## Mattermost Integration

### Enable Incoming Webhooks, Custom Username, and Profile Picture for Webhooks

1. Ensure you are logged in as a system admin account on your Mattermost server.
2. Check if your Mattermost installation can receive incoming webhooks and set a custom username and profile picture for webhooks. 
   1. Go to "System Console" --> "Integrations" --> "Integration Management".
   
   ![Integration management](../img/mattermost/integration-management.png)
   
   2. Ensure the parameters "Enable incoming Webhooks", "Enable integrations to override usernames", and "Enable integrations to override profile picture icons" are set to true.

   ![Enable incoming webhooks](../img/mattermost/enable-incoming-webhooks.png)

### Set a Webhook in Mattermost

1. Ensure you are logged in as a system admin account on your Mattermost server.
2. Go to "Integrations" --> "Incoming Webhooks" --> "Add incoming Webhook".

   ![Add incoming webhook](../img/mattermost/add-incoming-webhook.png)

3. Create the incoming webhook:

   ![Create incoming webhook](../img/mattermost/create-incoming-webhook.png)

* **Title**: Kitsu
* **Description**: Kitsu
* **Channel**: You can create a new channel or use an existing one because the message will be sent to a user.
* **Lock to this channel**: Set to False.
* **Username**: Kitsu (this will be overridden by Kitsu).
* **Profile Picture**: Not important; it will be overridden by Kitsu.

4. After clicking "Save", Mattermost will generate a new URL. Copy this URL.

5. Paste the URL in the "Settings" of Kitsu under the text field "Mattermost Webhooks (optional)" and click "Save settings".

   ![Add mattermost webhook settings](../img/mattermost/add_mattermost_webhook_settings.png)

> **_Note:_** Users who want notifications enabled must be on the same Mattermost server used in these steps.

### Enable Mattermost Notifications

Each user can set notifications to be pushed to Mattermost in their profile. They need to switch "Mattermost notifications enabled" to "Yes" and enter their "Mattermost username".

![Add Mattermost username in profile](../img/mattermost/add_mattermost_username_profile.png)

You're done!