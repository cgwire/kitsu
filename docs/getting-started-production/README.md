# Getting started as a Production Manager

## Create your first production

The first step on Kitsu is to create a production. Click on the **Create a new
production** button.  

![Create a production](../img/getting-started/create_production.png)

Enter your production name, choose **TV Show** if you need more than one episode.
Then you have to fill technical information, as the number of FPS, the Ration, Resolution.

All theses data will be used when Kitsu will reencode the video previews uploaded.

Then you need to define a start and end dates for your production.

![Add a production](../img/getting-started/add_production.png)

On the next part 3 to 6, you can define your production pipeline.
First you need to select your asset task type, shot task type, then the task status and asset types.

![Add a production Pipeline](../img/getting-started/add_production_pipe.png)

Then 7 and 8 are the option parts. If you already have a spreadsheet with your asset / shot.

See batch Action section for more details 

[Batch Action](../batch-action/README.md#create-assets-from-a-csv-spreadsheet-file)

Validate everything with the ![All done](../img/getting-started/all_done_go.png) button.


## Create assets

So, now you have the first script for your production. Next, it's time to do the
breakdown and the creation of the assets. Finally, it allows you to list your assets, 
dispatch the work to the artists, and follow each related
task's progress.

Let's begin with the asset page. You can access it via the drop-down menu on the top of the page. 

![Drop down menu asset](../img/getting-started/drop_down_menu.png).

On the asset page, click on **Add assets**.

![Asset page first time](../img/getting-started/add_assets_first.png)

A pop-up window opens:
 
It asks you to choose the asset **Type** (1): Camera, Characters, Environment,
FX, Props, ...  
Let's start with a character. 

Then, you select the **Main Pack**, or the **episode** (2)

We give it a **Name** (3) and enter a description that helps the Artist knows what to do and identifies the asset quickly.

If you have multiple assets to create, click on **Confirm and stay**. 


![Create an asset](../img/getting-started/add_asset_popup.png)

You can change the asset type and keep adding assets. 

You can also customize the asset type list. 
[Customization of the workflow](../customization/README.md#modify-an-existing-asset-types) )


You can see the newly created asset appearing in the background every time you click on **Confirm and stay**. 


After adding your last asset, click
on **Confirm**. It saves the asset and closes the window. If you don't have
more assets to add, click on **Close**, it cancels the window.

The assets are linked with the  first episode **E01** (created per default by Kitsu) or with the **Main Pack**.

![Global asset page](../img/getting-started/asset_edit.png)

You will also see the tasks are created at the same time. Per default all the tasks of your library will be added. If you have set your parameters, only the selected tasks will be added.

If you need to add more **Assets** you can click on the **Add assets** button.

You can edit assets by going to the asset page, hovering the asset you want to modify, and then click on the **edit** button 
![Edit button](../img/getting-started/edit_button.png) (1) on the right side of
the line.  

![Edit an asset](../img/getting-started/asset_edit01.png)

On the main asset page, to extend the description, click on the first words (2), and a pop-up opens with the full description.

To delete an asset see the FAQ : [How to delete an asset](../faq-deletion/README.md##how-to-delete-an-asset)


## Create extra tasks for the assets

If you realize you miss some task type on your pipe line, you need to add the new task type on your library.

(To add new Task Type see [Customization of the workflow](../customization/README.md#create-a-new-task-type) )

Once it's done, you need to add them into your **Setting** page too. 

Then, click on the **+ Add tasks** on top of the spreadsheet. 

![Add tasks button](../img/getting-started/add_tasks_asset.png)

A new window will open, and on the list you can choose the task you need to add.
You can also choose to create tasks for **the project**  or **For current list and filters** and validate it by the **Confirm** button.

![Add task to an asset](../img/getting-started/add_task.png)

## Create tasks for specific assets type

You can choose to create tasks only for **filtered elements**. For example, you want to create 
**Rigg** tasks only for the characters.

You need to type **Characters** on the search bar on the global asset page.

![Characters filtered](../img/getting-started/chara_filtered.png)

Then click on **+ Add tasks**. Next, select the task type, here **Rigging**, and switch to **For current list and filters**.

Valid with **Confirm**.

![Tasks filtered](../img/getting-started/task_filtered.png)

If you remove the filter characters, you will see the tasks only created for the selected elements.

![Tasks filtered Created](../img/getting-started/delete_task_done_chara.png)

You can also delete tasks for specific Asset Type. 
For exemple you want to keep **Rig** only for the characters.

You need to type **-Characters** on the search bar on the global asset page. This way the page will filter 
everything **but** the characters.

![Tasks filtered](../img/getting-started/no_character_filtered.png)

Then select the task type you want to delete for the filtered view. Click on the arrov next to the name 
of the task type and select **Delete all**.

![Tasks filtered no chara](../img/getting-started/no_character_delete.png)

Once the pop-up opens, type the name of the task type, and double check it's set to **For current list and filters**.

![Tasks filtered no chara rigging erased](../img/getting-started/delete_task_done.png)

If you remove the filter **-characters**, you will see the tasks only created for the selected elements.


![Tasks filtered no chara rigging erased](../img/getting-started/delete_task_done_chara.png)


You can also delete only a task or selected tasks. If some assets don't match the task (as environment and setup), click on the menu to change the action (1), 
then select the ** delete tasks** (2) on the left top
of the page.
![Delete button](../img/getting-started/delete_task.png) 

Now that we have created all the assets and related tasks, we can now add the
artists to the team and assign tasks to them.


## Create (episodes) sequences and shots

It's time to do the breakdown of the storyboard. Meaning you can create
the sequences and the shots of the episode and associate assets to them.

Nb: Episodes are only mandatory for **TV Show** Production.

You need to go to the **Shots** page: you can use the
drop-down menu and click on the **SHOTS**.

![Drop down menu shot](../img/getting-started/drop_down_menu_shot.png) 

To start with the shot creation, click on the **Add shots** button.

![First add shots](../img/getting-started/new_shot.png)

A new pop-up opens for the creation of the assets.
You can now create the episodes, the sequences, and the shots.

Enter the first episode using your code name, e01, then click
on the **add** button (1). Then, for instance, do the same for the sequence, for instance, sq01,
then **add** (2), and now the shots: sh001, then again **add** (3).
You can also define padding for your shots.

![Manage shots](../img/getting-started/manage_shot.png)

You can now see that new shots are listed, described by their episode and
sequence.
You have created the first shot of the first sequence of the first episode.

Now let's add more shots than just one! As you can see, the box already contains your name
code but incremented, so you have to continue to click on **add** to
create more shots.

![Add shots](../img/getting-started/add_shots.png)

You have to do the same with the sequences and episodes.

If a shot is misplaced on a sequence, you have to edit the shot you want
![Edit button](../img/getting-started/edit_button.png), and change the
sequence. 

![edit shot Change sequence](../img/getting-started/edit_shot.png)


![Change sequence](../img/getting-started/change_seq.png)

If at some point you need to delete a shot, click on the **trash can**
icon on the right of the line ![Delete button](../img/getting-started/delete_button.png). 
If you need to import back this shot, click on the restore button 
![Restore button](../img/getting-started/restore_button.png).

To delete a shot see the FAQ : [How to delete a shot](../faq-deletion/README.md#how-to-delete-a-shot)

To delete a sequence see the FAQ : [How to delete a Sequence](../faq-deletion/README.md#how-to-delete-a-sequence)



## Add the Frameranges

At this stage of the production, the animatic should be done. Meaning you have
the length (**Number of frames**, **frame range In** and **frame range Out**) for each shot. You can
add this information to the spreadsheet.  This way, you are sure that all
the frames a calculated, and none are missing or over computed.

You may also be able to add a camera as an asset!

You need to edit the shots to fill the frame range information. Click on the
edit button ![Edit button](../img/getting-started/edit_button.png) on the right
side of the shot line.

![edit shot Change sequence](../img/getting-started/edit_shot.png)

You can enter the **In** and **Out** of the shot on the new window. Then, save with the **Confirm** button. 

![Shot edit page](../img/getting-started/shot_edit.png)

Now the frame range appears on the general spreadsheet of the shot page.

![Shot edit page](../img/getting-started/shot_framerange_global.png)

Now that you have unlock the **Frames**, **In** and **Out** column, you can fill them 
directly from the global shot page.

Click on the case you want to fill, and you will be able to add the data.

![Shot edit page](../img/getting-started/shot_framerange_global_edit.png)


You can also use the **CSV Import** to update quickly your frame range.
 [Update Shots information with CSV Import](../batch-action/README.md#update-shots-information-with-csv-import)

You can have access to the shot values history too.

![Shot framerange detail](../img/getting-started/shot_framerange_detail.png)

![Shot Values History](../img/getting-started/shot_values_history.png)



## Create extra tasks for the shots

If you realize you miss some task type on your pipe line, you need to add the new task type on your library.

(To add new Task Type see [Customization of the workflow](../customization/README.md#create-a-new-task-type) )

Once it's done, you need to add them into your **Setting** page too.

Then,  click on
the **+Add tasks** button ![Add task button](../img/getting-started/add_task_button.png)
on the top of the spreadsheet. 

A new pop-up opens and lets you choose what task you want to add. All the
shots are linked to the tasks if you select the **For project** option.

![List of tasks for the shots](../img/getting-started/task_shots.png)


## Add a new user

Each Artist required an account. Go to the drop-down menu ![Main
menu](../img/getting-started/main_button.png), and under the **Studio**
section, choose **PEOPLE** page.

![People Menu](../img/getting-started/main_menu_people.png)

Then, click on the **+ Add a new user** button. 

![Add a new user](../img/getting-started/add_employee.png)

A creation window opens. You can enter the first (1) and last name (2), the email
(which is **mandatory** to create the account) (3), the phone number (4).

You can also add the new user to a **Deparment** (or several) (5).
See **DEPARTEMENT DOCUMENTATION**

Then you need to define the role of the user: **Artist**, **Supervisor**,
**Studio Manager**, **Vendor** or **Client** (6).  If the Artist is working right now, keep
him active, otherwise select no. Validate by clicking the **Confirm** button.

![Create a new user](../img/getting-started/create_employee.png)

See the [permissions](../permissions/README.md) section for more information. 
To make it short, artists, supervisors, and clients only see the
productions they are assigned.

All the people are now part of your studio. They are added to a specific
production when you add them to a team on a production. Otherwise, they
won't have access to anything.



## Add a User to the team

You need to add someone to a production to assign him a task.

On the drop-down menu on the top of the page, select the **TEAM** page.

![Drop down menu team](../img/getting-started/drop_down_menu_team.png) 

On the **Team** page, you can see all the assignations for a specific project.
If you want to check another project team, you need to switch the project
to the top of the page.

![Team page](../img/getting-started/team_page.png)


## Assign tasks to an Artist

We can now get back to the **ASSETS** page via the drop-down menu.

![Drop down menu asset](../img/getting-started/drop_down_menu_asset.png).

Now it's time to do your first assignment! 

Click on the status (1) you want to assign.

![Assigned a task](../img/getting-started/task_assigned.png)

The **Action Menu** on top of the screen appears. 

![Blue menu](../img/getting-started/blue_menu.png)

You can now do the assignation. Click on the text input, and you see
the list of available people. Click on a person's name to perform to select
him. Then click on the confirmation button to complete the assignation.

![Selected people](../img/getting-started/select_people.png)

You can assign several tasks to the same person in one step (1). Once you have
the blue menu visible, keep **ctrl** on your Keyboard pressed and select
multiple tasks. You can even use the **shift** key to choose a range of tasks
(2). When you have chosen everything you need, apply with the **Confirm**
button.  

![Assigned multiple people](../img/getting-started/assigned_multiple.png)

In the same way, you can click on **Clear assignations** to remove all 
assignations, or press the **Escape** key.

When you finish all the assignations, quit this mode using the **Clear
current selection** button ![Clear current selection](../img/getting-started/clear_current_selection.png).

Now you can see next to each status the avatar of the ArtistArtist.

![Assigned people](../img/getting-started/assignation.png)

To unclutter the list, you can hide this information with the **Hide
assignations** button on the top of the spreadsheet ![Hide assignations](../img/getting-started/hide_assignation.png).

Once you assigned someone, he is part of the production team. Depending
on his position (Artist, Supervisor, Vendor), he only sees the production where
he's assigned. 

Now, everybody knows what to do and who is doing what!



## Change status

To write a comment and to change the status of a task, you can click on the
status of the task (1). 

![Shot status](../img/getting-started/shot_status.png)

It makes appear a panel on the right, and here you can write a comment (1) and change the status (2), attach a file (3).


Validate the post and the new status with **Post status**

![Changing status](../img/getting-started/changing_status_shot.png)

## Add a Preview

You can add one or several previews to any comments. It can be a picture (`.png`, `.jpg`, `.jpeg`), or a video (`.mp4`, `.mov`, `.wmv`), 
or an `.obj` file. You can review all the previews from the browser or a mix of everything.

Other files like `.pdf`, `.zip`, `.rar`, `.ma` or `.mb` however, they need to be
downloaded to be reviewed.

If you have defined a **FPS** for the production, Kitsu conforms to the uploaded video to this FPS.

Otherwise, the video is compressed to 1080P and 30mbits/sec. 

Click on the "Attach preview" button. The explorer opens and lets you choose your file or several files.

![attach preview](../img/getting-started/attach_preview.png)

Once your file is selected, you see its name near the "Attach preview" button.

![attach preview confimed](../img/getting-started/attach_preview_confirm.png)

You can also **drag & drop** the file in the comment section.

![attach preview drag drop](../img/getting-started/drag_drop_preview.png)


## Add a thumbnail

You can use the preview as a **thumbnail** on the asset or shot spreadsheet. It
helps to recognize the assets/shots on the main pages. 
On the list page, click on the status you want, then on the right panel, click on the **Preview** button (1).

![Thumbnail Button](../img/getting-started/pannel_history.png)

Once you have clicked on the button, you see the thumbnail appears, and the button turns gray.

![thumbnail applied](../img/getting-started/pannel_history_thumbnail.png)

## Create a breakdown list

Filling the breakdown help you with the assembly of the shots. With the
breakdown, you have all the details of the assets you need to add to create your
shot. We are sure to omit nothing.

On the drop-down menu, choose **BREAKDOWN**.

![drop down Menu breakdown](../img/getting-started/drop_down_menu_breakdown.png)

On the left part of the breakdown page is the episode/sequence/shot menu (1); you can choose between those you created. They are the right part of
the screen; all the assets created are available for this production (main pack and episodes) (3). Moreover, in
the middle section, it is your selection for the shot (2).

![Breakdown page](../img/getting-started/breakdown_general_empty.png)

So now you have to select the shot you want to cast.

If you don't have thumbnails yet, you can choose to display the assets as text.


![Breakdown page text display](../img/getting-started/breakdown_text_display.png)

You may also realize during your breakdown that an asset is missing from the list.

You can create a new asset directly from the breakdown page. Click on the **+** on the right of the **All available assets**.

![Breakdown page create asset](../img/getting-started/breakdown_create_asset.png)


You can also choose multiple shots at the same time. Click on the first shot, hold the **shift** key and click on the last shot of your selection.

![Breakdown page global bulk select](../img/getting-started/breakdown_general_bulk_select.png)

Then click on the assets you want
to assign: characters, backgrounds, ... from the right part (3). 
If you have selected multiple shots, your selection is applied to the numerous shots, as well.

When you pass over the asset, you can see a **+1** or **+10**. It's the number
of times you add this asset. You can click as many times as you need on it.

![Breakdown add asset](../img/getting-started/breakdown_add_asset.png)

You can now see the asset appearing in the middle part of the screen (2). Next
to the name of the asset is the number of times it has been added. In this
example, we have added two times the character asset Llama.


If you add an asset twice by mistake, you have to go on the middle part of
the screen to select assets for this shot (2). From there, click on
**-1**.  When you are done with this shot, go on with the other shots. 
Your selection is automatically saved.

![Breakdown remove asset](../img/getting-started/breakdown_remove_asset.png)

If a new asset is created during the storyboard, get back to the asset
page (using the drop-down menu), create the assets you
need. The tasks previously created are applied immediately to these new
assets. However, you have to do the assignation, and then you are good to
continue with the breakdown.

Now your **Breakdown** page should look like this.

![breakdown add asset bulk](../img/getting-started/breakdown_general_bulk_select_full.png)

You can also make a breakdown list for your assets if you need to assemble them and keep track of the separated parts.

On the top left corner of the screen, choose **asset** in the drop-down menu, below **FOR**.

![Breakdown asset menu](../img/getting-started/breakdown_asset_menu.png)

You now have access to a second drop-down menu, where you can choose your asset type: **Character**, **Environment**, **Props**, **FX**, ...

![Breakdown asset type](../img/getting-started/breakdown_asset_menu_type.png)

You can fill the asset breakdown page the same way as the shots. First, select one or more assets on the left part and then add the right part's elements.



## Perform a review

When an artist needs a review, he changes the status of his task too![wfa](../img/getting-started/wfa_icon.png).

Click on the status (1) to open the right panel and start the review. 

You can watch the version from the right panel, enlarge it (2), or even go fullscreen ![Fullscreen](../img/getting-started/fullscreen.png) (3).

![review on global page](../img/getting-started/review_global.png)

You can draw directly on the preview with the **pencil** tool and select a color ![Pencil](../img/getting-started/draw.png). 

![review drawing](../img/getting-started/review_comment.png)

You can also add **text** on the frame.

![review drawing text](../img/getting-started/review_comment_text.png)

If you need to delete your line, click again on the **pencil** icon, the cursor changes to a multi-directional cross ![Pencil](../img/getting-started/direction_arrow.png), and then you can select your line and move it around.

![review drawing](../img/getting-started/review_edit.png)

Select the line with the directional cross, and then press the **delete** icon ![Delete line](../img/getting-started/delete_line.png)


If you go into **Full-Screen**, you can compare two task type or version side by side when you click on the **Compare** button 
![compare button](../img/getting-started/compare_button.png).

![compare button](../img/getting-started/compare_version.png)

From there, you can change the status too![Retake](../img/getting-started/retake_icon.png) if you want that the ArtistArtist
performs some changes. 

You can add a **checklist** to your comments.

You need to click on the **Add checklist** button, and the first item of the checklist appears. 

![add checklist](../img/getting-started/add_checklist.png)

Type your comments, and hit the **Enter** key to add another line on your checklist or click again on the **Add Checklist** button.

![checklist](../img/getting-started/checklist_detailed.png)

Besides your comment, you can also attach a preview. Click on the **Add attachment** button.

![attachment](../img/getting-started/attachment_retake.png)


You can also **tag** someone on the team in the comments. Type the `@`and it opens a sub-menu with the list of the team. 

![Tag someone](../img/getting-started/tag_team.png)

Alternatively, you can change it to ![Done](../img/getting-started/done_icon.png) to notify the ArtistArtist that his work is validated.


## The timesheets

As Studio Manager, you can use the main menu to check the timesheets.

Open the main menu with the ![main button](../img/getting-started/main_button.png) button. 

On the menu, choose the **Timesheets** page.

![main button](../img/getting-started/timesheet_menu.png)

Per default, Kitsu will display the timesheet of all the production, but you can choose to see 
the timesheet for a specific production only.

![main button](../img/getting-started/timesheet_day.png)

You can choose which **month** or **year** you want to display.

You can also choose the detail level: **day**, **week**, **month**.

Per week, Kitsu highlights the overdue time per ArtistArtist.

![main button](../img/getting-started/timesheet_week.png)

If you click on a number, a side panel opens with the details of the time spent per task this week.

You can also set up several working hours per day. 

Go back to the main menu and select **Settings**. 

![Setting](../img/getting-started/setting.png)




