# Managing Episodes

<!-- #region body -->

```mermaid
flowchart TD
    PRODUCTION -->|contains| EPISODE
    EPISODE -->|contains| SEQUENCE
```

TV Show productions have access to Episode containers to organize sequences and shots.

## Episodes Overview

In your production menu, click `Episodes`:

![episodes menu item](/guides/production-structure/manage-episodes/images/0.png)

You'll then reach the Episodes page with a full list of episodes for the current production:

![episodes page](/guides/production-structure/manage-episodes/images/1.png)

## Create Episodes

<!-- #region setup -->

In the `Episodes` page, click `New episode` in the top right corner:

![new episode button](/guides/production-structure/manage-episodes/images/2.png)

A modal appears. Fill the form and click `Confirm`:

![new episode modal](/guides/production-structure/manage-episodes/images/3.png)

- **Name**: the episode name
- **Status**: the production status of the episode (canceled, complete, running, standby)
- **Description**: a short description of what the episode is about
- **Resolution**: the episode resolution e.g "1920x1080", "4K", etc.

<!-- #endregion setup -->

## Update Episodes

Hover over the episode row you wish to edit in the list and click the `Edit` icon:  

![edit episode button](/guides/production-structure/manage-episodes/images/4.png)

## Delete Episodes

Hover over the episode row you wish to remove in the list and click the `Delete` icon:  

![delete episode button](/guides/production-structure/manage-episodes/images/5.png)

<!-- #endregion body -->