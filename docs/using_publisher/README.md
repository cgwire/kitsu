# Publishing a preview with the Kitsu Publisher

You must first have the Kitsu publisher and the plugin installed on your computer.

## Consult your to-do list

First, you must log into the publisher using your kitsu address, login, and password, as you would with your usual Kitsu.

You directly arrive on your to-do list and have access to the same option as on Kitsu.

You can see your to-do list, the done list, and timesheets.

![Kitsu Publisher todo list](../img/getting-started/publisher_todolist.png)

If you want to comment or publish on a task, simply click on the status.

![Kitsu Publisher todo list status](../img/getting-started/publisher_todolist_status.png)

The comment panel will open with the previews and the whole history of this task.

The first new element is that you have direct access to your timesheet. You can move the cursor to adapt the timeline to the number of hours spent on this specific task.

![Kitsu Publisher to-do list Comment panel](../img/getting-started/publisher_todolist_comment.png)

When you are ready to publish your work, click on the **Add a review to publish** button.


## Publish a preview from the publisher

You now have the choice between the traditional way of publishing by uploading the preview by yourself. Or you can let Kitsu Publisher do it for you.

Kitsu Publisher will recognize your opened DCC and the project opened.

![Kitsu Publisher DCC list](../img/getting-started/publisher_dcc_list.png)

You can select your Camera and your render engine of choice. Then select if you want to take a screenshot or render the whole animation.

Here, for example, we select the **Screenshot** option. Kitsu publisher will ask your DCC to do the render for you and display the result.

![Kitsu Publisher DCC Screenshot](../img/getting-started/publisher_dcc_screenshot.png)

Once satisfied with the result, you can click on **Confirm**. It will close the pop-up window, and you will be back in the comment panel. You can now type your comment, change the status and click on **Post Comment** to upload the preview into Kitsu and share it with your team.

![Kitsu Publisher comment](../img/getting-started/publisher_post_comment.png)

Now everybody logged in to Kitsu will see your comment and publish.


## Setup the publisher
### Change the save directory and add scripts

You can go to the setting menu when you click on your avatar.

![Kitsu Publisher settings Menu](../img/getting-started/publisher_settings_menu.png)

You have two options here: the first one is the directory for exports made by the DCCs.

Per default, it's set to your temporary directory. You can change it, and then this specific folder will be used for all the exports. You can also use a network drive.

The second option is about the command you can launch after the exports made by the DCCs but before the upload into Kitsu.

You can launch a command or a script directly on the exported file, the folder, etc.

![Kitsu Publisher settings option](../img/getting-started/publisher_settings_option.png)


You can insert variables in your command. You just have to put the chosen variable under curly brackets (for example: {exportFile}). These variables are also in the environment variables at runtime. They are listed below:

- exportsDirectory (String) : the directory path where the exports are made.
- exportFile (String): the path of the file that will be exported.
- exportIsAnimation (Boolean) : true if the export is an animation else false.
- exportIsScreenshot (Boolean) : true if the export is a screenshot else false.
- DCCName (String) : the name of the DCC.
- DCCVersion (String) : the version of the DCC.
- currentProject (String) : the path of the current project opened in the DCC.
- cameraSelected (String) : the name of the Camera selected.
- rendererSelected (String) : the name of the renderer selected.
- extensionSelected (String) : the name of the extension selected.
- entityName (String) : the name of the entity.
- entityTypeName (String) : the name of the entity type.
- episodeName (String) : the name of the episode type.
- fullEntityName (String) : the full name of the entity.
- projectName (String) : the name of the project.
- taskStatusName (String) : the name of the task status.
- taskTypeName (String) : the name of the task type

### View the result of the setting on the export pop-up

Once your preview is rendered, you can check the directory and the scripts launched.

![Kitsu Publisher settings result](../img/getting-started/publisher_settings_result.png)

If you click on the option icon you will see the command launched before the import.

![Kitsu Publisher settings result detailed](../img/getting-started/publisher_settings_resul_detailt.png)

If everything is fine, click on **Confirm** to close the pop-up.

And then post your comment as usual.
