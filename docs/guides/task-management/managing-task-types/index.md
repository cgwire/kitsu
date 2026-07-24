# Managing Task Types

```mermaid
flowchart TD
    SEQUENCE -->|tracked by| TASK
    SHOT -->|tracked by| TASK
    ASSET -->|tracked by| TASK
    DEPARTMENT -->|groups| TASK_TYPE
    TASK_TYPE -->|type of| TASK
    TASK_STATUS -->|current state of| TASK
```

Task types can be associated with multiple entities such as assets, shots, sequences, episodes, or edits.

## Creating a New Task Type

<!-- #region setup -->

First, let's create all the **Task Types** needed to manage and track our production.

From the main menu, select the **Task Types** page under the **Admin** section:

![Task Type](/img/getting-started/menu_tasktype.png)

::: tip
By default, Kitsu provides some example task types that can be used for a CGI production. You can rename or remove any that are not relevant to your production.
:::

You will notice that these **Task Types** are already linked to a department.

![Task Type Empty](/img/getting-started/task_type_empty.png)

You can click on the `Add Task Type` button to create new **Task Type**:

![add task type button](/img/getting-started/add_tasktype.png)

Next, you will need to supply some information about your task type, including:

- The name of the task type
- If team members need to time log their work for tasks with this task type
- For which entity it will be used
- To which department it should be linked
- The color (this will be reflect in the background color on the main spreadsheet page)

![Create task](/img/getting-started/create_task.png)

You'll notice that the **Departments** we created previously are available as an option to link task types to. Connecting a department to a specific task type can help your team stay organized.

![Create task department](/img/getting-started/create_task_department.png)

Click on **Confirm** to save your changes.

::: warning
Newly created task types will appear at the bottom of the list
:::

To adjust the order, simply click on the **Task Type** and drag it to its appropriate position in the list.

![Create task top list](/img/getting-started/created_task_top.png)

Congratulations, your task type has now be created in your **Global Library**.

::: warning
Once you have created your production, you need to add the **Sequence**, **Episode**, and **Edit** task types to your **Production Library**.
:::

::: tip
At any point during production, you can revisit this section to create additional **Task Types** as necessary and add them into your workflow.
:::

<!-- #endregion setup -->

## Adding Task Types in a Production

On the **Navigation Menu**, choose on the dropdown menu the **Setting**.

![Drop Down menu Setting](/img/getting-started/drop_down_menu_setting.png)

By default, Kitsu will add the **Task Types** you have chosen when creating the production.

![Setting Task Type new](/img/getting-started/setting_task_new.png)

However, you can add or remove specific **Task Types** if they are created on the Global Library first.

For example, you can import the task workflow from another production in your library.

![Setting Add Task Type](/img/getting-started/setting_task_add.png)

On the **Task Types** tab, you can choose which production or task type you want to import  or remove on this production,
validate your choice with the **Import** button.

::: warning
If you had a new task type **AFTER** creating an asset or shot, here is the **DELIVERY** task type.

![Setting Task Type add](/img/getting-started/setting_task_add2.png)

You need to **add this task type** on the global page.

![Add Task Type Global](/img/getting-started/global_add_task.png)

A pop-in will appear, and you must select the new task type on the dropdown menu.

![Add Task Type Global](/img/getting-started/add_task_current.png)

Validate with **Confirm**.

![Add Task Type example](/img/getting-started/add_task_example.png)
:::

## Update a Task Type

Go to `Main Menu > Task Types`:

![update task type page](/guides/task-management/managing-task-types/images/0.png)

Click the tab for the entity type you need (asset, shot, sequence, episode, or edit) and hover over the task type row you wish to select then click the `Edit` icon:

![update task type button](/guides/task-management/managing-task-types/images/1.png)

## Remove a Task Type

To remove a task type from your studio's Global Library, go to `Main Menu > Task Types` and hover over the task type row you wish to select then click the `Delete` icon:

![remove task type global](/guides/task-management/managing-task-types/images/2.png)

To remove an task type from your production library, go to `Production Menu > Settings > Task Types` and click the `Remove` button to remove the task type from the list:  

![remove task type production](/guides/task-management/managing-task-types/images/3.png)