---
path: "/guides/production-structure/manage-sequences"
slug: "manage-sequences"
published_at: 2026-09-10
---

# Managing Sequences

<iframe width="560" height="315" src="https://www.youtube.com/embed/Y5Fx6jlgQok?si=8WzQxoSdRSQ3nIwZ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

<!-- #region body -->

```mermaid
flowchart TD
    PRODUCTION -->|contains| EPISODE
    PRODUCTION -->|contains, non-episodic| SEQUENCE
    EPISODE -->|contains| SEQUENCE
    SEQUENCE -->|contains| SHOT

    EPISODE -->|tracked by| TASK
    SEQUENCE -->|tracked by| TASK
    SHOT -->|tracked by| TASK
```

In Kitsu, you can also track tasks at the **Sequence** Level.

It's especially useful when you have macro tasks to track, like Story and color Board, Color Grading, etc.

Use the navigation menu to go to the **Sequences** page:

![Navigation Sequences](/guides/production-structure/manage-sequences/screenshots/002.png)

You can access all the sequences in one go or per episode if your production is a TV show:

![Sequences page](/guides/production-structure/manage-sequences/screenshots/003.png)

You can assign tasks, do reviews, change status, add a metadata column, fill in the description, etc.

If you click on the name of a sequence, you will see the detail page of this sequence.

![Sequence detailed page](/guides/production-structure/manage-sequences/screenshots/004.png)

On the detailed page, you have access to the sequence casting to see all the assets used in the whole sequence.

You can also access the schedule, Preview Files, Activity, and Timelog of the sequence **tasks**.

## Create a Sequence

<!-- #region setup -->

You can create a sequence with the **+ New Sequence** button.

![add a sequence](/guides/production-structure/manage-sequences/screenshots/006.png)

::: tip
You can create a sequence directly from here (+New sequence button) or create a sequence linked to your shots from the global shot page.
:::

<!-- #endregion setup -->

## Update a Sequence

Hover over the sequence row you wish to edit in the list and click the `Edit` icon:  

![edit sequence button](/guides/production-structure/manage-sequences/images/0.png)

## Delete a Sequence

Hover over the sequence row you wish to remove in the list and click the `Delete` icon:  

![delete sequence button](/guides/production-structure/manage-sequences/images/1.png)

<!-- #endregion body -->
