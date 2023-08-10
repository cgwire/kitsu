# Custom Actions

## What is a Custom Action?

A custom action is a simple HTTP request that sends information from your
current Kitsu selection to a custom endpoint. In other terms, when your user
is in its Kitsu UI, he can send a request to an another sever containing the
IDs of the selected elements.

### Goal

The aim is, probably until there is a plugin system, to be able to create an
action outside of Kitsu (so we don't have to touch Kitsu/Zou core code).
Basically it's a web request, usually a POST (but can be a GET) to a
page/service you handle yourself. You catch the request and then do something.

Examples:

- Debug page (for a given objects display all the information I can access, including field names etc)
- Launch render in CGRU or Flamenco
- Get some statistics pages for the APM
- Create some special playlists
- Launch a custom protocol (with a service waiting for it) start a video player, any DCC, etc
- Plug it with an asset manager like Kabaret to open it at the right spot (or launching some actions)

It can be anything as long as you can catch the request (using for
example a python webserver such as flask or tornado.web, is very easy). It's
made to extend kitsu to somewhere you control.
In any case, useful information is provided to whatever catches the request,
such as what is selected (and what is probably the things you are going to
apply the action on), the page you were, the user who launched the action,
etc. So you can adapt the answer to the provided information.
Note that you can also run the custom action in the background (ajax request
instead of opening a new page), if you don't need feedback to the user.


## How to Setup a Custom Action

### Creation

Only studio managers can setup a custom action. The custom action page is
available in the right panel in the admin section.

When you have access to the custom action page you can create a new action via
the add button on the top right. The action creation requires four information:

* *name*: The name of the action.
* *url*:  The target URL (we strongly recommend you to use the same domain as
  your Kitsu installation).
* *entity type*: For which kind of entity the custom action will be available.
* *Use AJAX*: To tell if the request must be sent as an AJAX request or as a
  form.

Once your action will be created, it will be accessible in the action top bar
When a user select tasks in the asset or shot lists, by going to the
*Run custom action* section, he will be able to execute the custom action for
the current selection.

### Data Sent via a Custom Action

Data are sent at JSON format. It contains an object with the following fields:

* `personid`: The ID of the user claiming the action.
* `personemail`:  The email of the user claiming the action.
* `projectid`:  The ID of the project of selected entities.
* `currentpath`:  Current url path in Kitsu web application.
* `currentserver`: Host of the Kitsu sending the custom action.
* `selection`:  List of selected task IDs.
* `entitytype`:  Type of entities for which tasks are selected.

Example:
```
{
  "personid": "b01bae1e-f829-458a-a1eb-131bb66628cc",
  "personemail": "admin@example.com",
  "projectid": "fa4d7f04-b8e0-4518-8dbc-2f24997ca76e",
  "currentpath": "/productions/fa4d7f04-b8e0-4518-8dbc-2f24997ca76e/assets",
  "currentserver": "localhost",
  "selection": "95c171e1-dfff-498f-93e3-548a739e3202",
  "entitytype": "asset"
}
```
