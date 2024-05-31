# Building Production Reports

## Get an Overview of the Production

As a Producer, having a comprehensive overview of the entire production process is essential. 

Kitsu offers various tools to help you stay informed and manage production efficiently without getting overwhelmed by notifications or losing focus.

#### Features of the News Feed

- **Real-Time Updates**: View all status changes as they happen, minute by minute.
- **Summarized View**: The right part of the screen displays the total number of news items and a breakdown by status.
- **Filtering Options**: Filter the list by Task Status, Task Type, and Person to focus on specific areas.
- **Comment Panel**: Clicking on a line opens the comment panel on the right, providing all necessary details.

![Newsfeed Page](../img/getting-started/newsfeed_comment_all.png)

#### Using Filters

You can customize the time frame for displaying information using the **Filters Builder** button. This is useful for focusing on specific supervisors or time periods.

![Newsfeed Page Detail](../img/getting-started/newsfeed_details.png)

#### Example

If you want to focus on a supervisor for a specific month, select their name and pick a date in the **From** box.

![Newsfeed Page Comment](../img/getting-started/newsfeed_comment_panel.png)


## Know the Current State of the Production - Short / Feature

Understanding the current state of your production is crucial. Kitsu provides detailed statistics and visualizations to help you track progress effectively.

#### Sequence Stats

The **Sequence Stats** page offers pie charts that depict the status of your production, sequence by sequence. The color scheme of the pie charts corresponds to the status, allowing you to quickly understand the state of your production.

![Global View Sequence](../img/getting-started/global_view_sequence.png)

- **All Sequences**: The first line represents the whole production.
- **All Tasks**: The first column includes all tasks simultaneously.

By focusing on the first pie chart, you can see the exact state of your production. For more details, look at the rest of the line to get a global view of each task type's state.

#### Asset Types Stats

Similar to Sequence Stats, the **Asset Types Stats** page provides pie charts for asset types, giving you a clear view of the asset status across the production.

![Global View Asset](../img/getting-started/global_view_asset.png)

#### Count View

You can also display data as **Counts** to see the exact number of assets, shots, or frames, along with their percentage per status.

![Global View Sequence Counts](../img/getting-started/global_view_sequence_detail_count_stat.png)

#### Exporting Data

You can export this page as a `.csv` text file and import it into spreadsheet software for further analysis and reporting.

By leveraging these tools, you can stay on top of the production process, ensuring everything runs smoothly and on schedule.


## Know the Current State of the Production - TV Show

You can access an extra information level on a TV show through the **Episodes Stats Page**.

### Retakes Display
The default setting for the **Episodes Stats** page is **Retakes**. This display lets you see the number of retakes (back and forth) for each episode on each task type. Only three colors are displayed:
- **Validated as Green**
- **Retakes as Red**
- **In progress as Grey**

![Global View Episode](../img/getting-started/global_view_episode_retake.png)

If you unfold an episode, you will see the percentage of each take and the evolution of the retakes versus approval. This helps you see the progress of each episode per task.

![Global View Episode Unfold](../img/getting-started/global_view_episode_retake_detail.png)

Usually, the first episodes have many back-and-forths, but it should get better over time. However, if late episodes still have many retakes, something must be fixed. It's time to discuss the issue with the director and the supervisor.

### Status Display

The second option for data display is **Status**. This status display works like the **Sequence** / **Asset Type** Stats page.

![Global View Episode Status](../img/getting-started/global_view_episode_stat.png)

You can also display data as **Counts**. This way, you'll see the exact number of shots/frames with the percentage per status.

![Global View Episode Status Count](../img/getting-started/global_view_episode_stat_count.png)

You can export this page as a `.csv` text file and import it into spreadsheet software.
 

## Ensure Tasks are On Time

To know if a task is on time, you need two things:
- The **Task Type** of the task
- An **Estimation** (Bid) in days, along with an estimated **Start date** and **Due date** for the task.

Once this information is entered, you can **compare estimation to reality** on the Task Type page.

![Task Type Filled](../img/getting-started/task_type_schedule_due_date.png)

### Methods to Compare Estimations and Actuals

There are two main ways to do this:
1. **Filtering by Due Date Status**
2. **Using the Gantt Diagram**

::: tip
Kitsu automatically grabs the date and status of **WIP** (Work in Progress) and **WFA** (Waiting for Approval). You can compare your **estimated start date** versus **when the Artist really starts**, and compare the **estimated due date** to **when the Artist asks for approval**.
:::

### Filtering by Due Date Status

On the **Tasks** tab, the first filter you see is **Due Date Status**. Set it to **Due before today** to display all tasks with a **Due date** set **Due Before Today**.

Next, to determine what is finished and what still needs to be finished. Use the **-Done** filter to exclude completed tasks.

![Task Type Due Before Today](../img/getting-started/task_type_due_before.png)

This will show you all the late tasks with the two filters applied, meaning they are only validated after the **Estimated Due Date**. The summary at the bottom of the page updates in real time based on the applied filters.

You can export this page as a `CSV` file and open it with spreadsheet software.

### Using the Late Status Filter

The **Late Status** filter built into the page helps you immediately see which tasks took more time than estimated (**Estimation over Duration**).

![Task Type Estimation over duration](../img/getting-started/task_type_estimation_duration.png)

Filter the late tasks using the **Due date late** option. There are two ways to calculate if a task is late:
1. **Estimated due date** versus **Feedback**
2. **Estimated due date** versus **Done**

Depending on your studio's calculation method, Kitsu will provide the answer.

![Task Type Late Feedback](../img/getting-started/task_type_late_feedback.png)

### Using the Gantt Diagram

On the **Task Type Page**, go to the **Schedule** tab. The **Start** and **End** dates of this task type, as set on the production schedule, are visible at the top of the screen.

The **Gantt Diagram** will be dark grey before and after these dates, providing a visual cue for task timing.

![Task Type Schedule](../img/getting-started/task_type_schedule_emplty.png)

Change the **Coloring** from **Status color** to **Late in Red**. This will show tasks in **Grey** if they are on time and **Red** if they are late.

![Task Type Schedule Late](../img/getting-started/task_type_schedule_coloring_late.png)

You can return to the **Tasks** tab for more details, and Kitsu will retain your filters from tab to tab.


## Understanding Why a Task is Late

Now that you know which tasks are late or will be late, you need to understand **why**. There are several reasons why a task might be late:

- The artist is overwhelmed with too many tasks.
- There is too much back-and-forth on the task.
- The task might be underestimated, making it difficult to finish on time.
- The previous task was already late.

### Checking an Artist's Workload

To check an artist's number of tasks, filter the **Task Type** page by the artist's name under the **Task** tab.

![Task Type Artist](../img/getting-started/task_type_artist.png)

You can also add the **-done** filter to see what the artist has left to do. Then add the **Due Date Status** filter to **Due previous week** or **Due this week**, depending on what you are looking for.

![Task Type Artist Filtered](../img/getting-started/task_type_artist_filtered.png)

This will show you how many tasks your artist has to complete.

### Identifying Back-and-Forth

To identify the number of back-and-forths, look at the Retakes column on the Tasks tab. Each **Red Dot** represents a **retake**. Click on the line to open the **Comment panel** and read the entire task history. This is the best way to understand what is happening—whether the artist misunderstood the brief or if the brief changed with each version.

![Task Type Retake](../img/getting-started/task_type_retake.png)

### Checking if the Task is Underestimated

To check if the task is underestimated, go back to the global page, click on the name of the shot or asset, and see the casting and all the extra information. For example, there might be too many characters in the scene, or it might be a big action scene.

![Shot Detail Casting](../img/getting-started/shot_detail_casting.png)

### Checking the Previous Task

Lastly, you can check the previous task while viewing the asset/shot in detail. Click on it to go to the dedicated **Task Type** page, where you can find detailed information about what was happening before. This can help you understand if delays in earlier tasks are affecting the current one.



## Duration over Estimation

To focus on the big picture and have a global view of the **Bid**, you can compare the estimated **Person days** versus the reality **Days Spent** on various pages.

### Estimation Summary

On the shots' global page, you can see the sum-up of all the estimations versus duration. You can also apply filters for more specific insights. 

For example, to focus on a specific sequence, filter your global page by the sequence's name. The sum-up at the bottom will update accordingly.

![Global Shot Page Sum-up Filtered](../img/getting-started/global_shot_sumup.png)

This allows you to know the **Duration** versus **Estimation** for that particular **Sequence**.

Similarly, you can filter the global asset page. 

For example, you can filter by a specific **Asset Type** such as **Character**. The sum-up at the bottom will update to show the estimation versus duration for that asset type.

![Global Asset Page Sum-up Filtered](../img/getting-started/global_asset_sumup.png)


### Task Type Duration over Estimation

To delve into details, click on the name of a task type. The sum-up at the bottom of the screen will show **Duration** versus **Estimation** for this specific task type.

![Task Type Sum-up](../img/getting-started/task_type_sumup.png)

You can get a global view or focus on a **specific status** or **Artist's name**. As on the global page, the sum-up will update with each filter applied.


![Task Type Sum-up Filtered](../img/getting-started/task_type_sumup_filter.png)

This way, you can closely monitor the performance and efficiency of specific tasks and artists, ensuring that estimations align with actual durations and making adjustments as necessary.


## Duration over Estimation for an Asset / Shot

To closely examine the details, you can display **Estimation** and **Time Spent** columns (duration) for each asset and shot in Kitsu.

### Viewing Estimations and Durations

On the global page for shots or assets, you can see the sum-up of each task's **Estimation** and **Duration**. This allows you to quickly identify discrepancies or issues.

![Global Shot Estimation](../img/getting-started/global_shot_est.png)

### Detailed Analysis

If something appears wrong or needs further investigation, click on the asset or shot name to go to the detail page.

On the detail page, at the top left of the screen, you'll find a summary of the asset's or shot's lifecycle. This includes details of each task's **Status**, **Estimation**, **Duration**, **Start and Due Date**, and **Assignation**.

![Detail Shot Estimation](../img/getting-started/shot_detail_casting.png)

This comprehensive view helps you understand where the discrepancies lie and take corrective actions if necessary. By closely monitoring these details, you can ensure better alignment between estimations and actual durations, leading to more accurate future planning and resource allocation.



## Checking Quotas

Kitsu provides two methods for calculating quotas per **shot Task Type**. 

### Method 1: Timesheet-Based Calculation

This method weights quotas according to the time spent on tasks as recorded in the timesheets. 

- **Task Completion**: Shots are considered completed upon the first feedback request. The quotas are then weighted based on the time recorded in the timesheet.

![Quotas stat page day weighted](../img/getting-started/quotas_day_weighted.png)

In this example, Kitsu calculates the daily quota using timesheet data.

![Quotas stat page day weighted detail](../img/getting-started/quotas_day_weighted_detail.png)

### Method 2: Status-Based Calculation

If no timesheet data is available, Kitsu uses status changes to calculate quotas.

- **Task Start**: The task is considered to have started when its status changes to WIP.
- **Task Completion**: The task is considered completed on the day the feedback request is made.

### Detailed Quota Calculation

Kitsu splits the completed frames among all business days between the task's start and end dates, attributing the number of frames (or seconds, or tasks) submitted per day/week/month to each artist.

![Quotas stat page day status](../img/getting-started/quotas_day_status.png)

At any point, you can click on a number to see detailed information in the right panel.

![Quotas stat page day weighted](../img/getting-started/quotas_day_status.png)

::: danger
**Note**: If no timesheet is filled, Kitsu defaults to considering:
- The task started with the first status change to WIP.
- The task was completed on the day the feedback request was made.
:::

This method ensures that even in the absence of detailed timesheet data, there is a reliable way to track task progress and calculate quotas accurately.


## Checking Timesheets of the Team

::: warning
All of the previous chapters are based on the fact that **Estimation** and **Duration** are filled for each task.
:::

Everybody has to do their part. You and the supervisor will handle the estimation, while your team will fill out their timesheets.

Navigate to the main menu and select the Timesheet page.

![Timesheet Global Day](../img/getting-started/timesheet_day.png)

### Viewing Timesheets

On this page, you can view each team member's timesheet by day. This allows you to check whether they fill it out daily, took a day off, or worked extra hours.

If you have a question about a timesheet entry, click on it to see the details of the production, task type, and specific task.

![Timesheet Detail Day](../img/getting-started/timesheet_detail.png)

Once everything looks good at the day level, you can change the **Detail Level** from Day to Week, Month, or Year.

![Timesheet Global Week](../img/getting-started/timesheet_week.png)

You can view all the productions you manage simultaneously or look at each production individually.

### Exporting Timesheets

As with all other pages in Kitsu, you can export the timesheet data as a CSV file and open it in spreadsheet software for further analysis.
