<script setup>
import EmbedCard from '../../.vitepress/theme/EmbedCard.vue'
</script>

# Getting Started With Kitsu

## Introduction

Kitsu is a production tracking tool built for studios working across 2D and 3D production, VFX, video games, and related fields. It's flexible enough to handle everything from a single still-frame ad to a full 3-hour feature film.

This page walks you through everything you need to get a studio up and running in Kitsu, in order:

1. [General Kitsu Settings](#_1-general-kitsu-settings): configure studio-wide settings like your logo, working hours, and chat integrations
2. [Studio Workflows](#_2-studio-workflows): set up the task types, statuses, and libraries that define how work moves through your studio
3. [Preparing Your Team](#_3-preparing-your-team): invite users, assign them to departments, and grant permissions
4. [Quick Tour](#_4-quick-tour): get familiar with the main menu, navigation, task spreadsheet, and other core interface elements
5. [Create a New Production](#_5-create-a-new-production): links to quickstart guides for different production types (TV shows, feature films, shorts, video games, NFTs, and more) and how to add teammates to a production
6. [Next Steps](#_6-next-steps): role-specific handbooks to onboard your supervisors, producers, artists, clients, and developers

By the end, you'll have a configured studio, an onboarded team, and a clear path to launching your first production.

## 1. General Kitsu Settings

First, let's customize your Kitsu instance to match your studio culture.

Click on the `Main Menu` button in the top left corner:

![Main Menu Button](/img/getting-started/main_button.png)

Under the `Admin` section, click on the `Settings` page.

![Main Menu Settings](/img/getting-started/menu_settings.png)

The page lists global settings that affect every production:

![Kitsu Settings](/img/getting-started/kitsu_setting.png)

1. Click on the **Set studio logo** button and select an image to replace the Kitsu logo 
1. Change the **Studio Name** to be used in your Kitsu instance
1. The number of working hours per day for scheduling and reporting

The Preferences section depend on your tastes:

1. You can opt to use original file names for downloads instead of automated names
1. Display images in HD quality by default if you have a very fast internet connection
1. You can also restrict artists from modifying timesheets older than one week
1. Display durations in hours instead of days if you have varying day lengths
1. Enable dark or light theme by default

Finally, you will also find a section covering various chat integrations. Please refer to the developer documentation's [Chat Integration](https://dev.kitsu.cloud/integrations/messaging/slack/) pages for more information on how to configure this.

::: warning
Remember to **Save Settings** at the end once you are finished.
:::

## 2. Studio Workflows

Next, we need to define how work moves through your studio.

### Understanding Studio Workflows

::: info Definition
**Workflow**: the structured coordination of tasks constituting the operational processes within a production. For example, in a CGI production, an asset goes through a series of tasks like modeling, rigging, and shading.

The **Workflow** of your production is the sum of your [Task Types](/guides/task-configuration/managing-task-types/) and [Task Statuses](/guides/task-configuration/managing-task-statuses/).
:::

::: info Definition
**Task Type**: a category of process, like modeling or shading
:::

::: info Definition
**Entity**: an individual object, e.g an asset or a shot
:::

::: info Definition
**Task**: a specific action or activity that needs to be done. Tasks are linked to entities and categorized by task type. Each task is then assigned to an artist.
:::

Once the workflow for your tasks is defined, the next step is to establish an **Approval Workflow**: define all the task statuses used for communication in the team. Task statuses track the progress of your production.

::: info Definition
**Task Status**: a specific stage or condition that a task must pass through as part of the review and approval workflow. Examples: Ready To Start, Work In Progress, Waiting For Approval, Retake, Done.
:::

Just like you can define an asset workflow (for example: Modeling, Shading, Rigging), you can define a workflow for shots, sequences, etc.

![](/img/getting-started/task_type_empty.png)

A library is a collection of reusable production elements that make up workflows; things like departments, task types, task statuses, and asset types, that you set up once and then apply across your projects, rather than recreating from scratch every time.

### Global Library VS Production Library

Kitsu has two types of libraries:

| Library | Access | Purpose |
|---|---|---|
| **Global Library** | Studio manager only | Studio-wide source of departments, task types, task statuses, asset types, and status automations |
| **Production Library** | Per-production | Populated by selecting elements from the Global Library |

This separation allows each production to have its own workflow if need be.

First, we set up the Global Library:

<EmbedCard title="1. Department Setup">
<!--@include: ../../guides/team-management/managing-departments/index.md#setup-->
</EmbedCard>

<EmbedCard title="2. Task Type Setup">
<!--@include: ../../guides/task-configuration/managing-task-types/index.md#setup-->
</EmbedCard>

<EmbedCard title="3. Task Status Setup">
<!--@include: ../../guides/task-configuration/managing-task-statuses/index.md#setup-->
</EmbedCard>

<EmbedCard title="4. Asset Type Setup">
<!--@include: ../../guides/task-configuration/managing-asset-types/index.md#setup-->
</EmbedCard>

<EmbedCard title="5. Status Automation Setup">
<!--@include: ../../guides/task-configuration/managing-task-statuses/index.md#statusautomationsetup-->
</EmbedCard>

When you'll later create your first production, you'll fill out the **Production Library** with the elements from the **Global Library**.

## 3. Preparing Your Team

Now that you have defined your studio workflows, it's time to organize your team so you have people to assign tasks to.

We will learn how to invite users to Kitsu, link them to departments, and grant them permissions:

<EmbedCard title="Adding & Inviting Users">
<!--@include: ../../guides/team-management/managing-teams/index.md#setup-->
</EmbedCard>

Later when creating our first production, we'll learn how to add teammates to a production team so that they can begin working on tasks.

## 4. Quick Tour

Now that your Kitsu instance is correctly configured, you can spend time familiarizing yourself with the user interface.

Let's take a look at the global asset page.

![Presentation of the global page](/img/getting-started/presentation_global.png)

On the top part (1), you have the **global navigation**, which is always visible throughout all the production pages.

**From left to right:**


### Main Menu

You open the main menu by clicking on the top left button, Kitsu![Main menu button](/img/getting-started/main_button.png) (or your Studio logo).

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

### 1.1. Navigation

You will see the navigation dropdown menu on the right of the main menu icon.

![Presentation of the global page](/img/getting-started/presentation_global_header.png)

You can choose between productions. The name of the actual production and the actual page are always displayed.

You can use the dropdown menu to navigate from production to production (if you have several).

Once you have selected a production, the next dropdown menu will help you navigate through the different pages of this production.


::: details Navigation details
The first section is about the tracking of your tasks:
- Assets
- Shots
- Sequence
- Edits (If you have created specific tasks)

The second section is more about the side of the production:
- Concepts
- Breakdown
- Playlists
- News feed

The third section is about statistics:
- Sequence Stats
- Asset Type Stats

The fourth section is related to Team Management:
- Schedule
- Quotas
- Team

The fifth section is about the settings of your production:
- Settings

::: tip
You start with the asset page, but you can change your production homepage to other entities (see the settings page)
:::

::: warning
If you realize you need an extra level of navigation, such as Episodes, you need to change your production Type to a TV Show.

If, on the contrary, you realize you don't need the **assets** or the **shots**, you also need to switch your production type to **Only Assets** or **Only Shots**.
:::

### 1.2. Global Search, News, Notification and Documentation

You have the global search on the right of the navigation dropdown menu. It's a quick access search that will display the first four results. If you need more results and filtering options, see the **Entity Search** page.


The next icon![News](/img/getting-started/canny.png) is a direct link to our news and feedback page.

You can see all the new features with an animated gif and also add suggestions about the next feature you want to see in Kitsu.

Next, the bell icon![Notification](/img/getting-started/notification_icon_on.png) displays your notifications (assignments, comments, tags). The number of unread notifications will be shown on the bell icon. There are various filters to help you stay on top of updates and revisit important ones when needed. You can easily mark notifications as read or unread or quickly filter by watching/non-watching to focus on what matters most and declutter your feed.

The last icon before your avatar is the documentation button.
![documentation button](/img/getting-started/documentation_button.png), that you are reading right now!

### 1.3. Personal Settings

You can click on your avatar to open your menu (settings, documentation, etc.).

![Profile enlarged](/img/getting-started/profil_enlarge.png).

### 2/3. The Tasks Spreadsheet

#### 2.1. Filters

The first element on the left is the filter box. You can type anything you want for simple filtering, sequence, asset type, etc.

If you need more advanced filtering, please use the filter builder button.

![Filter Builder](/img/getting-started/filter_builder.png)

You can then save all the filters and use them on your pages.

#### 2.2 Simplify the display

On the right part of the screen, there are some buttons (from left to right) to hide or display the assignment, hide or display the extra column, enlarge or reduce the thumbnail,
![display and Hide option](/img/getting-started/display_hide_option.png)

#### 2.3. Import / Export

batch import thumbnail ![batch import thumbnail](/img/getting-started/add_thumbnails.png), and finally import ![Import button](/img/getting-started/import.png) or export ![export button](/img/getting-started/export.png) data.

#### 2.4. Metadata column

Below, you have the name of the column. the (+) next to **Name** ![Add metadata column](/img/getting-started/add_column_custom.png) is here to create a new metadata column. Then, you have the name of the task type column.

#### 2.5. Customize the view

On the far right of the screen, next to the scroll bar, is the option to hide and display a text column

![Display/hide text column](/img/getting-started/visible_column_detail.png).

#### 3. Entity spreadsheet

The main part of the screen is common to all the entities (asset, shot, sequence, Edit). This is the global tasks spreadsheet.

Here, you see the status, assignment, priority, etc, for each task.

::: tip
The spreadsheet's first line and column header always appear at the top of the page, even if you scroll down.

You can also **Stick** other columns to keep them visible at all times.
:::

### 4. View Summary

The last part (4), at the bottom of the screen, is the summary of your displayed page. It'll mirror your filters.

You can see the number of elements (assets or shots), the total number of estimated days, and the total number of days already spent.

## 5. Create a New Production

Now that you have designed your global workflow and invited more people, it's time to create your production:

- [Quickstart for TV Shows](/recipes/for-tvshows/)
- [Quickstart for Feature Films](/recipes/for-feature-films/)
- [Quickstart for Shorts](/recipes/for-shorts/)
- [Quickstart for Video Games](/recipes/for-videogames/)
- [Quickstart for NFTs](/recipes/for-nfts/)
- [Quickstart for Shots-Only Productions](/recipes/shots-only-productions/)
- [Quickstart for Assets-Only Productions](/recipes/assets-only-productions/)

The last setup step is to add studio teammates to the production:

<EmbedCard title="Adding Users to a Production Team">
<!--@include: ../../guides/team-management/managing-teams/index.md#adding-users-to-a-production-team-->
</EmbedCard>

## 6. Next Steps

- [About Team Roles](/guides/team-management/team-roles/) - An overview of the different team roles and corresponding permissions available in Kitsu.
- [Kitsu for Supervisors](/handbooks/for-supervisors/) - A list of the main workflows for supervisors.
- [Kitsu for Producers](/handbooks/for-producers/) - A list of the main workflows for producers.
- [Kitsu for Artists](/handbooks/for-artists/) - A list of the main workflows for artists.
- [Kitsu for Clients](/handbooks/for-clients/) - A list of the main workflows for clients.
- [Kitsu for Developers](https://dev.kitsu.cloud/) - A list of resources for developers.