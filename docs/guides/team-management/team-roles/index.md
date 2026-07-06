## Permission Roles

### Understanding Permission Roles

::: warning Definition
A permission role defines a set of access rights and privileges granted to a user within a system or application, dictating what actions they can perform and what resources they can access.
:::

Roles are very important, so it's useful to understand what each of them does and which ones might be relevant to specific team members. Click into each of the sections below to learn more about each permission role.

- **Artist**
::: details Artist Permissions
Artists can only access the productions they are part of. They can comment on tasks, upload media, and change statuses only on tasks that have been assigned to them. Their access is limited to a predefined set of statuses as determined by the Studio Manager.

**They can:**
* Create personal filters on the global page and Task Type page.
* Edit their own comments.
* Check the checklist on their assigned tasks.
* Create playlists-on-the-fly for shots or assets, but won't be able to save these playlists.

**They cannot:**
* See client comments.
* Access anything inside of projects that they haven't been assigned to.

When an artist logs in to Kitsu, the first page they will see is their **My Tasks** page.

![my task](../img/getting-started/my_task_page.png)
:::

- **Supervisor**
::: details Supervisor Permissions
Department supervisors inherit Artist permissions.

Department supervisors have read and write access to their department(s) they work on:
assets, shots, tasks, assignments, statistics, breakdown, and playlists.

**They can:**
* Assign tasks to their team artists (same department).
* Post comments on all tasks or their department(s).
* Check a checklist in their own department.
* Pin a comment.
* Edit their own comments.
* Add/edit a playlist for the studio or the client.
* See client comments and validations.
* See comments from other departments.
* View the timesheets of their team department(s).

**They cannot:**
* Access the studio team, the main timesheets, and the production list
* Define task types, task statuses, and asset types.
* Comment on other departments than theirs; they can't assign artists from other departments.
:::

- **Production Manager**
::: details Production Manager Permissions
Production managers inherit Department supervisor permissions.

Production managers have read and write access to the productions they are assigned to, including
assets, shots, tasks, assignments, statistics, breakdowns, and playlists.

**They can:**

* Create assets and shots, either manually or through a CSV batch import.
* Post comments on any tasks within the production.
* Edit any comment within the production.
* Check any checklist within the production.
* Pin any comment within the production.
* Add a task column.
* Delete or add a task.
* Add/edit a playlist for the studio or the client.
* See client comments and validations.

**They cannot:**

* Access the studio page, the main timesheets, and the production list.
* Define task types, task statuses, and asset types.
:::

- **Studio Manager**
::: details Studio Manager / Administrator Permissions
A Studio Manager acts in the same way as an Administrator, having read and write access to all productions and settings within Kitsu. Some of their privileges include:

#### Create and edit a production

The Studio Manager can create a new production, define its type, FPS, ratio, and resolution, and add a cover picture. They can also edit and delete any production.

#### Manage the studio

The Studio Manager has access to everything in the studio, including:

* Read / write access across all the productions
* Access to the global timesheets page
* The ability to view all people in the studio
* Access to the main schedule

In the People page, The Studio Manager **defines the permission role of each user**.

They can also:

* Customize global aspects of Kitsu: for example adding and modifying task types, task statuses, and asset types.
* Set permission roles
* Customize high-level studio information, such as customizing the studio name adding the company logo, and defining the number of hours per day of work etc.
* Choose to use the original filename for downloading media.

#### Manage productions

They have full access to all productions on your Kitsu site. Additionally:

* They have the same permissions as the supervisor.
* They can add / delete a task column.
* They are allowed to create custom metadata columns.
:::


- **Vendor**
::: details Vendor Permissions
Vendors have similar permissions to artists. The main difference is that while an artist can still see tasks in their production (though they can only edit tasks assigned to them), a vendor can only see and edit tasks that they are specifically assigned to. Everything else that is not assigned is hidden.
:::

- **Client**
::: details Clients Permissions
The client can only see the production of which they are part of.

**They can:**

* Access the global page of the assets/shots.
* Access the stats pages.
* Access Client playlists with limited access to task status when they post a comment

**Note**
* Only Supervisors and the Studio Manager can see the Client retake or validation status.


**They cannot:**

* See task assignments
* See comments that they didn't write
:::