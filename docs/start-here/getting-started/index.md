<script setup>
import EmbedCard from '../../.vitepress/theme/EmbedCard.vue'
</script>

# Getting Started With Kitsu

With Kitsu, users can track various production projects, encompassing 2D and 3D production, VFX, video games, and other related endeavors.

The content tracked by Kitsu can be as simple as still-frame advertisements, to extensive 3-hour feature films, accommodating projects with varying numbers of elements

But before jumping into our production, we must first configure our **Studio Workflow**.

## 1. Studio Workflows

### Understanding Studio Workflows

::: warning Definition
A workflow is defined as the structured coordination of tasks constituting the operational processes within a production.
:::

For example, within a CGI production, tasks such as modeling, rigging, and shading are undertaken to finalize an asset.

::: warning Definition
- Processes such as modeling, shading, etc., are referred to as a **Task Type**.
- An individual objects such as asset, shot, etc., are called **Entities**.
- A **task** can be defined as a specific action or activity that needs to be done. Tasks can be attributed to **entities** and will usually be categorized with a **task type**.
:::

Entities with corresponding tasks form foundation of your asset workflow. Each task will then be assigned to an artist. Once you have determined your assets workflow, you will do the same for the shots, sequences, etc.

Once the workflow for tasks is defined, the next step involves establishing an **Approval Workflow**, which entails defining all the statuses utilized for communication within the team. Statuses will also be useful for tracking the progress of your production.

The **Workflow** of your production is the sum of your Tasks and Status.

### Global Library VS Production Library

In Kitsu, you have two kinds of **libraries**:
- The first is the **Global Library** at the studio level.
Only the Studio manager has access to it.

- The second is the **Production Library**, where you will pick elements created in the global library to fill out.

The idea is to keep each production separated with a specific workflow.


Your **Global Library** is where you can create and modify departments, task types, task statuses, asset types, and status automation. You can create as many elements as needed, name them as you wish, and select the best colors and options to suit your needs.

<EmbedCard title="1. Department Setup">
<!--@include: ../../guides/team-management/managing-departments/index.md#setup-->
</EmbedCard>

<EmbedCard title="2. Task Type Setup">
<!--@include: ../../guides/task-management/managing-task-types/index.md#setup-->
</EmbedCard>

<EmbedCard title="3. Task Status Setup">
<!--@include: ../../guides/task-management/managing-task-statuses/index.md#setup-->
</EmbedCard>

<EmbedCard title="4. Asset Type Setup">
<!--@include: ../../guides/task-management/managing-asset-types/index.md#setup-->
</EmbedCard>

<EmbedCard title="5. Status Automation Setup">
<!--@include: ../../recipes/status-automation/index.md#setup-->
</EmbedCard>

Once your **Global Library** is populated, you can fill out the **Production Library** with the newly created elements from the **Global Library**.

## 2. Main Kitsu Settings

### Configuring Kitsu

Several global settings can be configured that apply to your studio, such as replacing the default Kitsu logo with your studio's logo.

To do this, click on the main menu button
![Main Menu Button](/img/getting-started/main_button.png), then under the **Admin** section, click on the **Settings**.

![Main Menu Settings](/img/getting-started/menu_settings.png)

### Studio Settings

Click on the **Set studio logo** and select an image to use. This will replace the Kitsu logo on your site and in various places across the app. You can also change the **Studio Name** to be used in your Kitsu instance.


The remaining settings on this page are global settings that affect every production. Some of these include:

- How many hours per day should your team be working.
- You can opt to use original file names for downloads.
- Display images in HD quality by default. Use this option only if you have a very fast internet connection.
- Regarding the timesheet, you can also restrict artists from modifying timesheets older than one week.

![Kitsu Settings](/img/getting-started/kitsu_setting.png)

Finally, you will also find settings relating to various chat integrations. Please refer to [Chat Integration](../chat-integration/index.md) section for more information on how to configure this.

::: warning
Remember to **Save Settings** at the end once you are finished.
:::

## 3. Preparing Your Team

Now that you have defined your workflow, it's time to organize your team so you have people to assign tasks to.

We will learn how to add users to Kitsu, link them to departments, grant them permissions, and finally, add them to a production team so that they can begin working.

<EmbedCard title="Adding & Inviting Users">
<!--@include: ../../guides/team-management/managing-teams/index.md#setup-->
</EmbedCard>

## 4. Quick UI Tour

### Introduction to the Kitsu Global Page

Welcome to Kitsu's global asset page.

Let's take a look around.

![Presentation of the global page](/img/getting-started/presentation_global.png)

On the top part (1), you have the **global navigation**, which is always visible throughout all the production pages.

**From left to right:**


### Main Menu

You will open the main menu by clicking on the top left button, Kitsu![Main menu button](/img/getting-started/main_button.png) (or your Studio logo).

You will find direct access to your assigned tasks, productions, global and team schedules, the workflow customization page, and the Kitsu settings on the main menu.

::: details Main Menu Details
**WORKSPACE**
- My Tasks: your assigned tasks
- My Checks: All the tasks with status **Is Feedback Request** depending on your department(s)
- My Productions: Get back to the selection on the production page.


**STUDIO**
- Productions
- People
- Timesheets
- Main Schedule
- Team Schedule
- All tasks
- News Feed
- Entity Search


**ADMIN**
- Departments
- Task Types
- Asset Types
- Custom Actions
- Automation
- 3D Backgrounds
- Bots
- Settings
- Logs

::: warning Permission Visibility
The WORKSPACE section is enabled for all permissions except My Checks, which artists do not see.

Artist (and above) can also see their own **Timesheets**, and have access to the **Entity Search**
:::

### Navigation

You will see the navigation dropdown menu on the right of the main menu icon.

![Presentation of the global page](/img/getting-started/presentation_global_header.png)


You can choose between production. The name of the actual production and actual page are always displayed.

You can use the dropdown menu to navigate from production to production (if you have several).

Once you have selected a production, the next dropdown menu will help you navigate through the different pages of this production.


::: details Navigation details
The first section is about the tracking of your tasks
- Assets
- Shots
- Sequence
- Edits (If you have created specific tasks)

The second section is more about the side of the production
- Concepts
- Breakdown
- Playlists
- News feed

The third section is about statistics
- Sequence Stats
- Asset Type Stats

The fourth section is related to Team Management
- Schedule
- Quotas
- Team

The fifth section is about the settings of your production
- Settings

::: tip
You start with the asset page, but you can change your production homepage to other entities (see setting page)
:::

::: warning
If you realize you need an extra level of navigation, such as Episodes, you need to change your production Type to a TV Show.

If, on the contrary, you realize you don't need the **assets** or the **shots**, you also need to switch your production type to **Only Assets** or **Only Shots**.
:::

### Global Search, News, Notification and Documentation

You have the global search on the right of the navigation dropdown menu. It's a quick access search that will display the four first results. If you need more results and filtering options, see the **Entity Search** page.


The next icon ![News](/img/getting-started/canny.png) is a direct link to our news and feedback page.

You can see all the new features with an animated gif and also add suggestions about the next feature you want to see in Kitsu.

Next, the bell icon ![Notification](/img/getting-started/notification_icon_on.png) displays your notifications (assignments, comments, tags). The number of unread notifications will be shown on the bell icon. There are various filters to help you stay on top of updates and revisit important ones when needed. You can easily mark notifications as read or unread or quickly filter by watching/non-watching to focus on what matters most and declutter your feed.

The last icon before your avatar is the documentation button.
![documentation button](/img/getting-started/documentation_button.png), that you are reading right now!


### Personal Settings

You can click on your avatar to open your menu (setting, documentation, etc.).

![Profile enlarged](/img/getting-started/profil_enlarge.png).

### The Tasks Spreadsheet

#### Entity spreadsheet

The second part of the screen is common to all the entities (asset, shot, sequence, Edit). This is the global tasks spreadsheet.

Here, you see the status, assignation, priority, etc, for each task.

::: tip
The spreadsheet's first line and column header always appear at the top of the page, even if you scroll down.

You can also **Stick** other columns to keep them visible at all times.
:::

#### Filters

The first element on the left is the filter box. You can type anything you want for simple filtering, sequence, asset type, etc.

If you need more advanced filtering, please use the filter builder button.

![Filter Builder](/img/getting-started/filter_builder.png)

You can then save all the filters and use them as your pages.

#### Simplify the display

On the right part of the screen, there are some buttons (from left to right) to hide or display the assignation, hide or display the extra column, enlarge or reduce the thumbnail,
![display and Hide option](/img/getting-started/display_hide_option.png)

#### Import / Export

batch import thumbnail ![batch import thumbnail](/img/getting-started/add_thumbnails.png), and finally import ![Import button](/img/getting-started/import.png) or export ![export button](/img/getting-started/export.png) data.

#### Metadata column

Below, you have the name of the column. the (+) next to **Name** ![Add metadata column](/img/getting-started/add_column_custom.png) is here to create a new metadata column. Then, you have the name of the task type column.

#### Customize the view

On the far right of the screen, next to the scroll bar, is the option to hide and display a text column

![Display/hide text column](/img/getting-started/visible_column_detail.png).

### Sum-up of your view

The last part (4), at the bottom of the screen, is the sum-up of your displayed page. It means the sum-up will update if you filter the page.

You can see the number of elements (assets or shots), the total number of estimated days, and the total number of days already spent.

## 5. Create a New Production

- [Quickstart for TV Shows](/recipes/for-tvshows/)
- [Quickstart for Feature Films](/recipes/for-feature-films/)
- [Quickstart for Shorts](/recipes/for-shorts/)
- [Quickstart for Video Games](/recipes/for-videogames/)
- [Quickstart for NFTs](/recipes/for-nfts/)
- [Quickstart for Shots-Only Productions](/recipes/shots-only-productions/)
- [Quickstart for Assets-Only Productions](/recipes/assets-only-productions/)

## 6. Next Steps

- [About Team Roles](/guides/team-management/team-roles/) - An overview of the different team roles and corresponding permissions available in Kitsu.
- [Kitsu for Supervisors](/workflows/for-supervisors/) - A list of the main workflows for supervisors.
- [Kitsu for Producers](/workflows/for-producers/) - A list of the main workflows for producers.
- [Kitsu for Artists](/workflows/for-artists/) - A list of the main workflows for artists.
- [Kitsu for Clients](/workflows/for-clients/) - A list of the main workflows for clients.
- [Kitsu for Developers](https://dev.kitsu.cloud/) - A list of resources for developers.
