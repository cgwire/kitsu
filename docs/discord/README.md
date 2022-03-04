# Discord Integration

## Create a bot account

1. Make sure you're logged on to the [Discord website](https://discord.com/).
2. Navigate to the [application page](https://discord.com/developers/applications).
3. Click on the "New Application" button.
4. Give the application a name (for example "Kitsu") and click "Create".

![Create application](../img/discord/create_application.png)

5. Create a Bot User by navigating to the “Bot” tab and clicking “Add Bot”.
    - Click “Yes, do it!” to continue.

![Create bot](../img/discord/create_bot_user.png)

6. It's possible to add an icon for the bot by clicking on the icon next to "Username".
It will be the same icon used when the bot chat.

7. Make sure that Public Bot is ticked if you want others to invite your bot.

![Public Bot ticked](../img/discord/public_bot.png)

8. Make sure that Server Members Intent is ticked to allow the bot to see other members of a server.

![Server Members Intent ticked](../img/discord/server_members_intent.png)

9. Copy the token using the "Copy" button. 

10. Copy the token in Kitsu in "Settings" and in the text field "Discord token (optionnal)" and after click on "Save settings"

![Add discord token to settings](../img/discord/add_discord_token_settings.png)

## Inviting your bot

So you’ve made a Bot User but it’s not actually in any server.

To add the bot in a server, follow these steps:

1. Make sure you're logged on to the [Discord website](https://discord.com/).
2. Navigate to the [application page](https://discord.com/developers/applications).
3. Click on your bot’s page.
4. Go to the “OAuth2” tab and after "URL Generator".
5. In "Scopes", tick only "bot"

![URL Generator Scopes](../img/discord/url_generator_scopes.png)

5. In "Bot permissions" tick only "Send Messages"

![URL Generator Bot permissions](../img/discord/bot_permissions.png)

6. Now the resulting URL can be used to add your bot to a server. Copy and paste the URL into your browser, choose a server to invite the bot to, and click “Authorize”.

> **_Note:_** The person adding the bot needs “Manage Server” permissions to do so.

> **_Note:_** The users who wants to have notifications enabled have to be in a same server than the bot.

## Enable notifications

Each user can set in their profiles the notification push to
Discord. They have to switch the "Discord notifications enabled" 
field to "Yes" and enter their "Discord username" (they're in the form username#number).

![Add discord username in profile](../img/discord/add_discord_username_profile.png)


You're done!
