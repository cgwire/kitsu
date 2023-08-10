# How to build production report



## Quotas Stat

Kitsu has two ways to calculate the quotas per **shot Task Type**.

The first is linked to the timesheet :
Shots are considered ended on the first feedback request. Then, quotas are weighted following time spent on the task (when the Artist filled his timesheet).

![Quotas stat page day weighted](../img/getting-started/quotas_day_weighted.png)

In this example, Kitsu has weighted the quota per day linked to the timesheet.

![Quotas stat page day weighted detail](../img/getting-started/quotas_day_weighted_detail.png)


If no timesheet is filled, then Kitsu considers that:

The task was started at the first status change to WIP.
The task was done the day the feedback request was made.
It splits the done frames among all business days between the start and the end.

Kitsu grabs the number of frames (or seconds, or number of tasks) submitted per day/week/month per Artist.

![Quotas stat page day weighted](../img/getting-started/quotas_day_status.png)




**1**: Select the Task Type.

**2**: Select the level of details, Day, Week, or Month.

**3**: Select the count mode, per Frame, Seconds, or tasks.

You can click on a number and see its detail on the right panel at any time.