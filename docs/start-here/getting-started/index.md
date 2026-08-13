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
4. [Create a New Production](#_5-create-a-new-production): links to quickstart guides for different production types (TV shows, feature films, shorts, video games, and more) and how to add teammates to a production
5. [Next Steps](#_6-next-steps): role-specific handbooks to onboard your supervisors, producers, artists, clients, and developers

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

<EmbedCard title="1. Department Setup" link="/guides/team-management/managing-departments#setup">
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

## 4. Create a New Production

Now that you have designed your global workflow and invited more people, it's time to create your production:

- [Quickstart for TV Shows](/recipes/for-tvshows/)
- [Quickstart for Feature Films](/recipes/for-feature-films/)
- [Quickstart for Shorts](/recipes/for-shorts/)
- [Quickstart for Video Games](/recipes/for-videogames/)
- [Quickstart for Shots-Only Productions](/recipes/shots-only-productions/)
- [Quickstart for Assets-Only Productions](/recipes/assets-only-productions/)

The last setup step is to add studio teammates to the production:

<EmbedCard title="Adding Users to a Production Team">
<!--@include: ../../guides/team-management/managing-teams/index.md#adding-users-to-a-production-team-->
</EmbedCard>

## 5. Next Steps

- [About Team Roles](/guides/team-management/team-roles/) - An overview of the different team roles and corresponding permissions available in Kitsu.
- [Kitsu for Supervisors](/handbooks/for-supervisors/) - A list of the main workflows for supervisors.
- [Kitsu for Producers](/handbooks/for-producers/) - A list of the main workflows for producers.
- [Kitsu for Artists](/handbooks/for-artists/) - A list of the main workflows for artists.
- [Kitsu for Clients](/handbooks/for-clients/) - A list of the main workflows for clients.
- [Kitsu for Developers](https://dev.kitsu.cloud/) - A list of resources for developers.