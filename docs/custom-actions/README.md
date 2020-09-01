# Custom Actions

## What is a custom action? 

A custom action is a simple HTTP request that sends information from your 
current Kitsu selection to a custom endpoint. In other terms, when your user
is in its Kitsu UI, he can send a request to an another sever containing the 
IDs of the selected elements.

## How to setup a custom action

### Creation 

Only studio managers can setup a custom action. The custom action page is
available in the right panel in the admin section. 

When you have access to the custom action page you can create a new action via
the add button on the top right. The action creation requires four information:

* *name*: The name of the action.
* *url*:  The taregt URL (we strongly recommend you to use the same domain as
  your Kitsu installation).
* *entity type*: For which kind of entity the custom action will be available. 
* *Use AJAX*: To tell if the request must be sent as an AJAX request or as a
  form. 

Once your action will be created, it will be accessible in the action top bar
When a user select tasks in the asset or shot lists, by going to the 
*Run custom action* section, he will be able to execute the custom action for
the current selection.

### Data sent via a custom action 

Data are sent at JSON format. It contains an object with the following fields:

* `personid`: The ID of the user claiming the action.
* `personemail`:  The email of the user claiming the action.
* `projectid`:  The ID of the project of selected entities.
* `currentpath`:  Current url path in Kitsu web application.
* `currentserver`: Host of the Kitus sending the custom action.
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
