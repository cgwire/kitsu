# Frequently Asked Questions

[[toc]]

-----------------------------------------	

## How to share a preview?

You can ask for a review by switching the status of a task to 
(**Waiting for Approval** ![wfa](../img/getting-started/wfa_icon.png)). This
status allows you to share your progress by posting a preview of your work. The
first step is to change the status of your task and write a comment. 

![Waiting for approval](../img/getting-started/wfa_status.png)

Then click on the **Attach preview** button.

A new window is displayed.

![Add preview file](../img/getting-started/add_preview.png)

You can either drag and drop you pic or video on the **Choose a file** button,
or navigate through your system and pick your file, validate with the
**Confirm** button. Then click on the **Post comment** button.

Your work will appear on the right part of the screen as a V1. 

![Preview v1](../img/getting-started/previewv1.png)

If you post more revisions, you will always keep track of your previous work.
Each time you add a new revision, the previous versions are still available. 

![Preview v2](../img/getting-started/previewv2.png)

 -----------------------------------------	

## How to change your password?

Click on your name on the top right of the screen (1) then on **Profile** (2).

NB: A link to this documentation is available and the Dark Theme in this menu too (3).
 
![User profile](../img/getting-started/user_profil.png)

If you keep scrolling you can also change your password if you want. We
encourage you to change the default password with one of your own.

![User password](../img/getting-started/user_password.png)

 -----------------------------------------	

## How to have an overview of the production?

### Task type overview page / Supervisor page

To access to the task type overview, you can click click on the **task type** name.

![Overview asset page](../img/faq/global_view_asset_task.png)

It will go to a page where you can see the state of all the **status** 
for this **specific task type** per asset or per shot.

![Overview asset task](../img/faq/supervisor_page.png)

You will find on these pages more information than on the global page. 
You can also [assigned](../getting-started-production/#assign-tasks-to-a-cg-artist) people from this page, and add an [estimation](../getting-started-production/#add-an-estimation-for-a-task) on the tasks.

You can also sort the information of the page, to focus on the important subject.

![Overview asset task](../img/faq/supervisor_page_sort.png)

You can also filter the information. As you already are in a task, you will just need to type the status needed : 
`wip`, `wfa`, `-done`, etc.

You can also earch per sequence or type of asset (`character`, or `seq01`)

### Sequence overview page

The other way is to go to the **Sequences** page. You can go there with the
drop down menu on top of a page.


![Drop down menu](../img/faq/drop_down_menu.png)

![Drop down menu sequence](../img/faq/drop_down_menu_breakdown.png)

With this view you can see all the status distribution per tasks on each
sequences.

![Overview sequence task](../img/faq/global_view_sequence.png)

You can fly over the pie chart to have more detailed information about the
distribution.

![Overview sequence detail](../img/faq/global_view_sequence_detail.png)

You can also click on the **tasks name** to have the detailed shots about this
task.


-----------------------------------------	
 
## How to create Filters?

### Introduction to filters

In **Kitsu**, the filters are set through the **search bar**. It allows you to
**save** your search query. Once done you can run your query again with a
simple click.
 
![Search bar](../img/faq/filter_search_bar.png)

You can find the **search bar** and the **save** option ![Search
bar](../img/faq/filter_save_button.png). in the following pages: 

* Assets
* Shots
* Sequences
* Todo-lists

NB: The **search bar** is available too in people episodes list.


### How to use the search bar?

The **search bar** query is applied everytime a new character is typed. You
don't need to type everything to get a prompt result.

For example, in the assets page, type the letter `O` and you wil get the
result of all the assets starting with a `O`.  

![Search bar result](../img/faq/filter_autocompletion.png)

You can also search some specific **type of asset** : `Props`, `Character`,
`Environment`, `Fx` ... The result will display all the assets from this type.

For example, let's search all the **FX** assets. 
	
![Search asset type](../img/faq/filter_asset_type.png)

Another example get **shots page** of a specific **sequence**.
Ex: see only the shots of the second sequence of the first episode.

Select the first episode on the drop down menu, then search `se02`, the result
 will get all the shots of all the episodes from sequence 2.

![Search bar sequence episode](../img/faq/filter_ep_seq.png)

In the same way, you can search **specific status** link to task. Type the
**name of the task** (or between `[` `]` if the task name is more than one word `[modeling low]`),
 then add the sign **equal**
(`=`) and the **status** you are looking for.

For example, search all the shots which are **Waiting for approval** ![WFA](../img/faq/wfa_icon.png)
at the **render** stage. So on the search bar you will type : `render=wfa animation=retake`.

![Search layout wfa](../img/faq/filter_lay_wfa.png)

You can be even more specific, lets focus on the shots that are still 
on retake at the animation stage : on the search
bar add a **space** after the previous search and type `animation=retake`. 
The research will be `render=wfa animation=retake`.

![Search layout wfa seq2](../img/faq/filter_lay_wfa_s002.png)

You can also searche for unassigned task for a specific type task.
For example `Animation = unassigned`.

### How to save filter queries?

Kitsu allows you to save your research. You can save them by pressing tne
**Enter**, or click on the **Save** button 
![Save button](../img/faq/filter_save_button.png).

Now under the **search bar** you can see your saved queries as buttons. 

![Search saved](../img/faq/filter_saved.png)

Everytime you get back to this page, the buttons will be there. It will help
you to run common queries faster.

### What filters can I create?

You can create **filters** about **entities**:

* **Sequences** : `se01`, `se02` etc. or exclude : `-se01`, `-se02` etc.
* **Asset Type** : `characters`, `environment`, `fx` etc. or exclude `-characters`, `-fx`, etc.

You can also create **filters** about **task status** by following this syntax:
**task=status**.

Expemples:

* Layout is work in progress (wip) : `layout=wip`
* Concept is waiting for approval (wfa) only for the fx : `concept=wfa fx`
* On sequence 2 Layout is wip : `se02 layout=wip`
* Animation is Retake and Render is waiting for approval (wfa) `animation=retake render=wfa`.



### How to delete filters?

If you have created a **filter button** by mistake, click on the cross next to
it ![Filter delete](../img/faq/filter_delete.png).

The result of the filter will be display, but not the button anymore. Just
cancel your research by deleting the text or use the cross next to the search
bar ![Search delete](../img/faq/filter_cross_delete.png)

-----------------------------------------

## Where can I see my notifications?

### How notifications work?

The notification symbol is the **Bell** button next to your name, top right of
the screen.  Its color is **grey** 
![Notification off](../img/faq/notification_icon_off.png) when you don't have
any notification, and **orange** 
![Notification on](../img/faq/notification_icon_on.png) when you have a new
one.

When you click on the **bell** button, it will open the **notifications** page.

There, you can see all the changes made to the **tasks** you are following or
assigned to you.

![Notification page](../img/faq/notification_page.png)

Notifications include the following information: 

* If it's a notification ![Notification page](../img/faq/notification_icon_comment.png) or a tag ![Notification page](../img/faq/notification_icon_tag.png)

* the name of the **author** ![Notification page](../img/faq/notification_author.png)

* the related **entity** ![Notification page](../img/faq/notification_entities.png)

* the related **task** ![Notification page](../img/faq/notification_task.png)

* the new **status** ![Notification page](../img/faq/wfa_icon.png)

* the **attached file** ![Notification page](../img/faq/notification_attached_files.png)

and the comment.

When you click on the empty space of the notification, the comments pannel on the right is displayed. You can answer directly from this page to any element.

Each part is a **link** you can use it to jump on the information you need. If
you click on the **status**, you will jump to the status page of the entity. So
you can react quickly to this new change.

For example, let's give Alicia a retake.

![Notification example 01](../img/faq/notification_example01.png)

Alicia receives immediately a notification, the **bell** button change color
![Notification on](../img/faq/notification_icon_on.png), and she can read the
new comment.

**All the notifications and comments appear in real time**. No need to refresh
to stay up to date.


![Notification example 02](../img/faq/notification_example02.png)

### How to get notified?

As an artist you will receive a notification 
![Notification](../img/faq/notification_icon_on.png) as soon as someone assigned you to a task, change
the status of one of your task, post a comment, or tag you on a comment.

You can also choose to follow specifics tasks. Go into the task page you want
to follow: on the **assets** or **shots** pages click onto the status icon, 
then on the **history** button on the right pannel.

![history button](../img/faq/pannel_history.png)

On the top right side of the page you can see an **eye** button 
![Notification off](../img/faq/notification_off.png).

![Follow button](../img/faq/notification_other_task.png)

By default you are following all the tasks you are assigned to, on the task
page the icon will be on (eye open) ![Notification on](../img/faq/notification_on.png). 

If you want to follow another task, click on the **crossed eye** button
![Notification off](../img/faq/notification_off.png). Its aspect will change,
it is not crossed anymore ![Notification on](../img/faq/notification_on.png)
meaning you are now following this task, and will receive notification about
it. 

### How to not be notified anymore?

If you don't want to follow a task anymore, just click on the **eye** button
![Notification on](../img/faq/notification_on.png) on the task page. It 
will be crossed ![Notification off](../img/faq/notification_off.png), meaning
you won't receive notifications anymore.


------------------------------------


## How to build a Playlist?


### How to create a playlist?

You can find the **Playlists** page on the drop down menu. 

![Playlist main menu](../img/faq/drop_down_menu_playlist.png)

The **playlists** page is separated in 3 parts: 

* (1): The playlist list where you can **create** a playlist, or load an existing one.
* (2): The shots of the current playlist. 
* (3): The **shots** you want to show.

![Playlist page](../img/faq/playlist_page.png)

Start by creating a **Playlist** 
![Playlist add button](../img/faq/playlist_add_button.png), You default name
will be the date and the hour. You can change it later via the
**edit** button ![Edit button](../img/faq/edit_button.png). 

![Playlist add page](../img/faq/playlist_add_page.png)

Once the playlist created, via the right pane, you can select wich shots to add
to your playlist.  Start by selecting the **episode** and the **sequence**.
The sequences shots are now listed. Click on the shots you want to add to the
playlist to see them playlisted.

The shots will appear on the middle part of the screen. Every changes are 
automatically saved.

![Playlist page](../img/faq/playlist_example.png)


### How to switch between tasks and revisions?

For each playlisted shot you can choose the **task** and the
**version** you want to see.

![Playlist task selection](../img/faq/playlist_task_selection.png)
![Playlist version selection](../img/faq/playlist_version_selection.png)


### How to delete a playlist?

To delete a playlist, load it by clicking on its name. Then,
click on the **delete** button ![delete button](../img/faq/delete_button.png). 
The button is located in the top right of the middle panel.

A confirmation pop-up will appear. Validate it by clicking the **Confirm**
button.

![Playlist delete popup](../img/faq/playlist_delete.png)

------------------------------------

## How to customize the workflow?

### How to edit an existing task type?

On the main menu ![Main menu](../img/faq/main_button.png) select the 
**TASK TYPES** page under the **Admin** section.

![Task Type](../img/faq/menu_tasktype.png)

On the main page, you will be able to edit all the tasks already created 
![edit button](../img/faq/edit_button.png).

![Task Type global page](../img/faq/task_type_global.png)

You can change : 
- (1) The name of the task type
- (2) The priority, meaning the order of the task types
- (3) For wich entity it will be used
- (4) If the artists need to timelog their work on this task type
- (5) The color 

![Edit task](../img/faq/edit_task.png)

Click on **Confirm** to save your changes.

### How to create a new task type?

On the main menu ![Main menu](../img/faq/main_button.png) select 
the **TASK TYPES** page under the **Admin** section.

![Task Type](../img/faq/menu_tasktype.png)

On the main page, click on the ![Add Task Type](../img/faq/add_tasktype.png)
button.

On the new pop up you can define your personalized task:

- (1) The name of the task type
- (2) The priority, meaning the order of the task type columns
- (3) For wich entity it will be used
- (4) If the artists need to timelog their work for tasks with this task type
- (5) The color 

![Add task](../img/faq/add_task.png)

Click on **Confirm** to save your changes.

### How to edit an existing status?

On the main menu ![Main menu](../img/faq/main_button.png) select the 
**TASK STATUS** page under the **Admin** section.

![Task Status](../img/faq/menu_status_type.png)

On the main page, you will be able to edit some status already created 
![edit button](../img/faq/edit_button.png). Except 
![Done Status](../img/faq/done_icon.png)
and ![Todo Status](../img/faq/todo_icon.png), which are parts of the core
system.

![Task Status global page](../img/faq/task_status_global.png)
 
You can change : 
- (1) The name of the status
- (2) His shortname, useful for the filters
- (3) If you can upload a preview with this task
- (4) If it's the end of the task
- (5) The color 

![Edit status](../img/faq/edit_status.png)

Click on **Confirm** to save your changes.

### How to create a new status?

On the main menu ![Main menu](../img/faq/main_button.png) select the 
**TASK STATUS** page under the **Admin** section.

![Task Status](../img/faq/menu_status_type.png)

On the main page, click on the ![Add Task Status](../img/faq/add_task_status.png) button.

On the new pop up you can define your personalized task : 

- (1) The name of the status
- (2) His shortname, useful for the filters
- (3) If you can upload a preview with this task
- (4) If it's the end of the task
- (5) The color 

![Add Status](../img/faq/add_status.png)

Click on **Confirm** to save your changes.

---------------------

## How to delete an asset

Go on the main page of the assets.

![Delete asset](../img/faq/delete_asset_global.png)

On the right part of the asset line, click on the 
![Delete button](../img/faq/delete_button.png) button.

A confirmation pop up will appear, validate with **Confirm**.

![Delete asset popup](../img/faq/validation_popup_delete_asset.png)

Once deleted, the asset will appear as crossed, it can be still restored 
with ![Restore asset](../img/faq/restore_button.png) .

![Delete asset](../img/faq/delete_asset1.png)

To definitively delete an asset, you have to click on 
![Delete button](../img/faq/delete_button.png) button a second time.

The asset will be remove from the database and won't appear anymore on Kitsu.

---------------------

## How to delete a shot

Go on the main page of the shots.

![Delete shot](../img/faq/delete_shot_global.png)

On the right part of the shot line, click on the 
![Delete button](../img/faq/delete_button.png) button.

A confirmation pop up will appear, validate with **Confirm**.

![Delete shot popup](../img/faq/validation_popup_delete_shot.png)

Once deleted, the shot will appear as crossed, it can be still restored 
with ![Restore asset](../img/faq/restore_button.png) .

![Delete shot](../img/faq/delete_shot1.png)

To definitively delete a shot, you have to click on 
![Delete button](../img/faq/delete_button.png) button a second time.

The shot will be removed from the database and won't appear anymore on Kitsu.

-----------------------

## How to delete a sequence

To delete a sequence, you must first delete all the shots on this sequence.
It's a safe guard.

If you don't delete all the shots of a sequence before deleting it, you will
see an error message after confirming the deletion.

![Delete sequence error](../img/faq/delete_sequence_error.png)

Once you have deleted all the shots of the sequence, use the drop down menu to
go to the sequence page.
 
![Drop down menu sequence](../img/faq/drop_down_menu_breakdown.png)
 
Then you can delete the sequence, with the 
![Delete button](../img/faq/delete_button.png) button.

![Delete sequence](../img/faq/delete_sequence.png)

-----------------------

## How to delete a task type

To delete a task type (shot or asset), go to the global spreadsheet page, 
and click on the arrow next to the name of the task type ![Delete sequence](../img/faq/arrow.png). 

A sub menu will appear with the option **Delete all** the tasks.
Once you have click on it, an message will appear and ask you to type the name of the task. You need to type it as it shows, it's case sensitive.

![Delete sequence](../img/faq/delete_tasktype.png). 