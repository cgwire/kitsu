# Quotas

**Quotas** visualize your **team speed**.

A quota refers to the specific amount of work or number of tasks an artist is expected to complete within a given timeframe, ensuring that the project progresses according to schedule and meets production deadlines.

You can see on average how many shots, frames, or seconds the artist needs to complete daily to finish all tasks within the **estimated number of days**.

Kitsu has two ways to calculate quotas per **task type**.

## Quotas Based on Timesheets

The first calculation method is based on daily timesheets filled out by the artists. 

Quotas are calculated from when the artist fills out their first timesheet on a task until they stop.

Shots are considered complete when the first feedback request is made. 

Quotas are then weighted according to the time spent on the task, as recorded in the timesheet by the artist.

![Quotas stat page day weighted](/img/getting-started/quotas_day_weighted.png)

In this example, Kitsu weights the daily quota based on the timesheet entries.

![Quotas stat page day weighted detail](/img/getting-started/quotas_day_weighted_detail.png)

## Quotas Based on Status Changes

If no timesheet is filled out, Kitsu uses status changes to estimate the duration:

- The task is considered started when the first status change to WIP occurs.
- The task is considered completed on the day the feedback request (WFA status) is made.

This is First Take quotas, meaning that back-and-forth comments are not included in the calculation.

Kitsu then distributes the completed frames across all business days between the start and end dates. It calculates the number of frames (or seconds, or tasks) completed per day/week/month per artist.

![Quotas stat page day status](/img/getting-started/quotas_day_status.png)

You can click on a number at any time to see its details in the right panel.

::: danger
**Note**: If no timesheet is filled, Kitsu defaults to considering:
- The task started with the first status change to WIP.
- The task was completed on the day the feedback request was made.
:::

This method ensures that even in the absence of detailed timesheet data, there is a reliable way to track task progress and calculate quotas accurately.

## Managing Department Quotas

At the beginning of production, while setting estimates for each task, a supervisor can also define estimated quotas for each of their artists. 

Once a task is approved, the remaining line on the Estimation tab of the Task Type page will update and display the remaining number of tasks and the updated estimated quotas.

You can monitor each team member to see if their estimated quotas stay within the initially established range.

![Supervisor Estimated Quotas](/img/getting-started/supervisor_quotas_estimated.png)

To check their **Actual Quotas**, go to the **Quotas** page.

![Quotas](/img/getting-started/supervisor_quotas.png)

The first column, **Average**, is the most important. Kitsu calculates the average quotas for each artist per **Day**, **Week**, or **Month**.

![Weekly Quotas](/img/getting-started/supervisor_quotas_week.png)