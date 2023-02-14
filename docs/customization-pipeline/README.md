# Pipeline customization

You can modify Kitsu to fit your studio vocabulary for the asset / Pre-production, task type, status, etc.

You can also add custom columns on the global page of the edit, episode, sequence, asset, and shots.

In Kitsu, you have two kinds of libraries; the first is the global library at the studio level.
Only the Studio manager has access to it. The second one is the production library where you will pick elements created on the global library to fill it.

The idea is to keep each production separated with a specific pipeline.



You can create and modify the department, task type, task status, asset type, and status automation on the global library.

You can create as many elements as you want, give the name you want, and choose the color and options that fit your needs the most.

Once your global library is populated, you can fill the production library with the newly created element from the global library.
 

## Task Type

### Create a new Task Type

On the main menu ![Main menu](../img/getting-started/main_button.png) select 
the **TASK TYPES** page under the **Admin** section.

![Task Type](../img/getting-started/menu_tasktype.png)

On the main page, click on the ![Add Task Type](../img/getting-started/add_tasktype.png)
button.

On the new pop-up, you can define your personalized task:

- (1) The name of the task type
- (2) For which entity it is used
- (3) If the artists need to time log their work for tasks with this task type
- (4) To which department is it linked
- (5) The color 

![Create task](../img/getting-started/create_task.png)

Click on **Confirm** to save your changes.

Per default, the new task type will be at the bottom of the list. To change the order, grab the task type and move it to its rightful place.

![Create task bottom list](../img/getting-started/created_task_bottom.png)

![Create task top list](../img/getting-started/created_task_top.png)

### Modify an existing Task Type

On the main menu ![Main menu](../img/getting-started/main_button.png) select the 
**TASK TYPES** page under the **Admin** section.

![Task Type](../img/getting-started/menu_tasktype.png)

On the main page, you can edit all the tasks already created 
![edit button](../img/getting-started/edit_button.png).

![Task Type global page](../img/getting-started/task_type_global_edit.png)

You can change : 

The order of the tasks by dragging and moving them to the wanted position.

- (1) The name of the task type
- (2) If the artists need to time log their work on this task type
- (3) To which department is it linked
- (4) The color 

![Edit task](../img/getting-started/edit_task.png)

Click on **Confirm** to save your changes.

**SEE Department page**


## Task Status


### Create a new Task Status

On the main menu ![Main menu](../img/getting-started/main_button.png) select the 
**TASK STATUS** page under the **Admin** section.

![Task Status](../img/getting-started/menu_status_type.png)

On the main page, click on the ![Add Task Status](../img/getting-started/add_task_status.png) button.

On the new pop up you can define your personalized task : 

- (1) The name of the status
- (2) His short name, useful for the filters
- (3) If this status is used to validate a task (useful for the quota, to clean the todo list, and episode stat page)
- (4) If this status is used to comment on a task (useful to keep track of the back and forth in the task type page and for the episode stats page)
- (5) Can the artist use this status? If **No** the artist won't see this status on his list. But he can post on top of it.
- (6) Can the client use this status? If **No** the client won't see this status on his list
- (7) Choose a color you like

![Add Status](../img/getting-started/add_status.png)

Click on **Confirm** to save your changes.


### Modify an existing Task Status

On the main menu ![Main menu](../img/getting-started/main_button.png) select the 
**TASK STATUS** page under the **Admin** section.

![Task Status](../img/getting-started/menu_status_type.png)

On the main page, you can edit some statuses already created 
![edit button](../img/getting-started/edit_button.png). Except 
![Done Status](../img/getting-started/done_icon.png)
and ![Todo Status](../img/getting-started/todo_icon.png), which are parts of the core
system.

![Task Status global page](../img/getting-started/task_status_global.png)
 
You can change : 
- (1) The name of the status
- (2) His short name, useful for the filters
- (3) If this status is used to validate a task (useful for the quota, to clean the todo list, and episode stat page)
- (4) If this status is used to comment on a task (useful to keep track of the back and forth in the task type page and for the episode stats page)
- (5) Can the artist use this status? If **No** the artist won't see this status on his list. But he can post on top of it.
- (6) Can the client use this status? If **No** the client won't see this status on his list
- (7) This option is linked to the quotas. This designed status will stop the calculation of the quota
- (8) Choose a color you like

![Edit status](../img/getting-started/edit_status.png)

Click on **Confirm** to save your changes.


## Asset Types

### Create a new Asset Types

On the main menu ![Main menu](../img/getting-started/main_button.png) select the 
**TASK STATUS** page under the **Admin** section.

![Asset type menu](../img/getting-started/menu_asset_type.png)

On the main page, click on the ![Add Asset Types](../img/getting-started/add_asset_types.png) button.

On the new pop-up, you can define your personalized Asset Type : 

![Add asset types name](../img/getting-started/add_asset_types_name.png)

You will be able to choose a name and a specific workflow for this new asset type.

Click on **Confirm** to save your changes.


### Modify an existing Asset Types

On the main menu ![Main menu](../img/getting-started/main_button.png) select the 
**ASSET TYPES** page under the **Admin** section.

![Asset Type](../img/getting-started/menu_asset_type.png)

On the main page, you can edit some Asset Types already created 
![edit button](../img/getting-started/edit_button.png). 

![Asset Task global page](../img/getting-started/asset_types_global.png)
 
You can change the name of the **Asset Type** and define its workflow. 

![Edit asset type](../img/getting-started/edit_asset_types.png)

For example, characters and backgrounds won't have similar task types, and the background won't use the rig.
Per default, all the asset types will use all the task types. But you can then select the task type you want to use.

![Edit asset type](../img/getting-started/edit_asset_types_workflow.png)


Click on **Confirm** to save your changes.


## Status Automation

### Create a new Status Automation

Status automation is here to do the heavy lifting for you.

You can create status automation for the asset and the shot tasks.

For the asset, you can choose to create status automation between tasks. For example, when the concept is validated, the modeling status must be ready. But you can also create status automation that changes the asset status according to a task status; for example, when the concept is validated, the asset is ready for the storyboard.

Go to the main menu, and select **Status Automation**.

![Main menu Status Automation](../img/getting-started/main_menu_status_automation.png)

Once on the new page, you can create status automation by clicking the **+Add status automation** button.

![create Status Automation](../img/getting-started/status_automation_empy.png)

You can choose between creating asset automation for the **asset** or the **shot**.

Then you can choose the **task type** and the **status** that will trigger the Automation.

Then you can select which task type will react to the Automation and choose the status that will be changed.

![detail create status automation](../img/getting-started/add_status_automation.png)

To trigger the change of ready for status, you need to change the trigger from Status to **Ready For**.
You will notice the **Applied task type** will now display **Shot task type**.

![detail create status automation Ready For](../img/getting-started/add_status_automation_readyfor.png)

To create status automation for shots, you must change the **Entity Type** to shots.


