# Workflow customization


## Modify an existing Task Type

On the main menu ![Main menu](../img/getting-started/main_button.png) select the 
**TASK TYPES** page under the **Admin** section.

![Task Type](../img/getting-started/menu_tasktype.png)

On the main page, you can edit all the tasks already created 
![edit button](../img/getting-started/edit_button.png).

![Task Type global page](../img/getting-started/task_type_global_edit.png)

You can change : 

the order of the tasks by drag and move them to the wanted position.

- (1) The name of the task type
- (2) If the artists need to time log their work on this task type
- (3) To which departement is it linked
- (4) The color 

![Edit task](../img/getting-started/edit_task.png)

Click on **Confirm** to save your changes.

**SEE Department page**

## Create a new Task Type

On the main menu ![Main menu](../img/getting-started/main_button.png) select 
the **TASK TYPES** page under the **Admin** section.

![Task Type](../img/getting-started/menu_tasktype.png)

On the main page, click on the ![Add Task Type](../img/getting-started/add_tasktype.png)
button.

On the new pop up you can define your personalized task:

- (1) The name of the task type
- (2) For which entity it is used
- (3) If the artists need to time log their work for tasks with this task type
- (4) To which departement is it linked
- (5) The color 

![Create task](../img/getting-started/create_task.png)

Click on **Confirm** to save your changes.

Per default the new task type will be at the bottom of the list. To change the order, grab the task type and move it a his right place.

![Create task bottom list](../img/getting-started/created_task_bottom.png)

![Create task top list](../img/getting-started/created_task_top.png)


## Modify an existing Task Status

On the main menu ![Main menu](../img/getting-started/main_button.png) select the 
**TASK STATUS** page under the **Admin** section.

![Task Status](../img/getting-started/menu_status_type.png)

On the main page, you can edit some status already created 
![edit button](../img/getting-started/edit_button.png). Except 
![Done Status](../img/getting-started/done_icon.png)
and ![Todo Status](../img/getting-started/todo_icon.png), which are parts of the core
system.

![Task Status global page](../img/getting-started/task_status_global.png)
 
You can change : 
- (1) The name of the status
- (2) His short name, useful for the filters
- (3) If this status is used to validate a task (useful for the quota, to clean tthe todo list, and episode stat page)
- (4) If this status is used to give comment a task (useful to keep track of the back and forth in the task type page, and for the episode stats page)
- (5) Can the artist use this status. If **No** the artist won't see this status on his list. But he can post on top of it.
- (6) Can the client use this status. If **No** the client won't see this status on his list
- (7) This option is linked to the quotas. This designed status will stop the quotas calculation
- (8) Choose a color you like

![Edit status](../img/getting-started/edit_status.png)

Click on **Confirm** to save your changes.

## Create a new Task Status

On the main menu ![Main menu](../img/getting-started/main_button.png) select the 
**TASK STATUS** page under the **Admin** section.

![Task Status](../img/getting-started/menu_status_type.png)

On the main page, click on the ![Add Task Status](../img/getting-started/add_task_status.png) button.

On the new pop up you can define your personalized task : 

- (1) The name of the status
- (2) His short name, useful for the filters
- (3) If this status is used to validate a task (useful for the quota, to clean tthe todo list, and episode stat page)
- (4) If this status is used to give comment a task (useful to keep track of the back and forth in the task type page, and for the episode stats page)
- (5) Can the artist use this status. If **No** the artist won't see this status on his list. But he can post on top of it.
- (6) Can the client use this status. If **No** the client won't see this status on his list
- (7) Choose a color you like

![Add Status](../img/getting-started/add_status.png)

Click on **Confirm** to save your changes.

## Modify an existing Asset Types

On the main menu ![Main menu](../img/getting-started/main_button.png) select the 
**ASSET TYPES** page under the **Admin** section.

![Asset Type](../img/getting-started/menu_asset_type.png)

On the main page, you can edit some Asset Types already created 
![edit button](../img/getting-started/edit_button.png). 

![Asset Task global page](../img/getting-started/asset_types_global.png)
 
You can change the name of the **Asset Type** and define its workflow. 

![Edit asset type](../img/getting-started/edit_asset_types.png)

For exemple characters and backgrounds won't have similar task types. Bakcground won't use the rig.
Per default all the asset type will use all the task type. But you can then select the task type you want to use.

![Edit asset type](../img/getting-started/edit_asset_types_workflow.png)


Click on **Confirm** to save your changes.

## Create a new Asset Types

On the main menu ![Main menu](../img/getting-started/main_button.png) select the 
**TASK STATUS** page under the **Admin** section.

![Asset type menu](../img/getting-started/menu_asset_type.png)

On the main page, click on the ![Add Asset Types](../img/getting-started/add_asset_types.png) button.

On the new pop up you can define your personalized Asset Type : 

![Add asset types name](../img/getting-started/add_asset_types_name.png)

You will be able to choose a name and a specific worflow for this new asset type.

Click on **Confirm** to save your changes.


## Create a new Status Automation

Status automation is here to do the heavy lifting for you.

You can create status automation for the asset and the shot tasks.

For the asset you can choose to create status automation between tasks, for exemple when concept is validated then change the modeling status as ready. But you can also create a status automation that change the asset status accoring to a task status, for example when concept is validation then the asset is ready for the storyboard.

Go to the main menu, and select **Status Automations**.

![Main menu Status Automation](../img/getting-started/main_menu_status_automation.png)

Once in the new page, you can create status automation by clicking on the **+Add status automation** button.

![create Status Automation](../img/getting-started/status_automation_empy.png)

You can choose between creating an asset automation for the **asset** or the **shot**.

Then you can choose the **task type** and the **status** that will trigger the automation.

Then you can select which task type will react to the automation and choose the status that will be changed.

![detail create status automation](../img/getting-started/add_status_automation.png)

To trigger the change of ready for status, you need to change the trigger from Status to **Ready For**.
You will notice the **Applied task type** will now display **Shot task type**..

![detail create status automation Ready For](../img/getting-started/add_status_automation_readyfor.png)

If you want to create status automation for shots, you need to change the **Entity Type** to shots.


## Use in production a new Status Automation

Once you have created your Status Automation for asset and shots, you can then apply them in your production.

From your production, go to the **Setting** page.

![dropdown menu setting](../img/getting-started/drop_down_menu_setting.png)

From there go to the **Status automation** tabs


![production setting](../img/getting-started/settings_parameters.png)

On the **Status Automation** tab you will have access to all the status automation you previewsly created.
You can now add anyone you want to use on your production. Once they are added they will be effective immediately.

![production setting status automation](../img/getting-started/setting_status_automation.png)

Now your setting page under the status automation tab should look like this : 

![production setting status automation](../img/getting-started/status_automation_exemple.png)


## Define specific workflow per production

### Select speticific Task Status for a production


On the **Action Menu**, choose on the drop down menu the **Setting**. 

![Drop Down menu Setting](../img/getting-started/drop_down_menu_setting.png)

Per default, Kitsu will load the Task Status you have define when created the production .

But you can choose to add or remove specific status.

![Setting status new](../img/getting-started/setting_status_new.png)

On the **Task Status** tab, you can choose which status you want to add or remove on this production, 
validate your choice with the **add** button.


![Setting Add Status](../img/getting-started/setting_status_add.png)


### Select specific Task Types for a production

On the **Action Menu**, choose on the drop down menu the **Setting**.

![Drop Down menu Setting](../img/getting-started/drop_down_menu_setting.png)

Per default, Kitsu will load the Task Types you have define when created the production .

![Setting Task Type new](../img/getting-started/setting_task_new.png)

But you can choose to add or remove specific Task Types.

For example you can create a 2D and A CGI workflow on your library, and add the needed task types into this production.


On the **Task Types** tab, you can choose which status you want to add o remove on this production, 
validate your choice with the **add** button.


![Setting Add Task Type](../img/getting-started/setting_task_add.png)


### Select specific Asset Types for a production

On the **Action Menu**, choose on the drop down menu the **Setting**.

![Drop Down menu Setting](../img/getting-started/drop_down_menu_setting.png)

Per default, Kitsu will load the Asset Types you have define when created the production .

But you can choose to add or remove specific Asset Types.

![Setting Asset type new](../img/getting-started/setting_asset_new.png)

On the **Asset Types** tab, you can choose which Asset Types you want to add or remove on this production, 
validate your choice with the "add" button.

![Setting Add Asset](../img/getting-started/setting_asset_add.png)


### Select specific Status Automation for a production

On the **Action Menu**, choose on the drop down menu the **Setting**.

![Drop Down menu Setting](../img/getting-started/drop_down_menu_setting.png)

Per default, Kitsu will load no status automation of your status automation library into your production.

![Setting Task Type new](../img/getting-started/setting_task_new.png)

But you can choose to use only specific Task Types, depending of the type of your production.

For example you can create a 2D and A CGI workflow on your library, and add the needed task types into this production.


On the **Task Types** tab, you can choose which status you want to use on this production, 
validate your choice with the **add** button.


![Setting Add Task Type](../img/getting-started/setting_task_add.png)
