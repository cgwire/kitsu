# FAQ for Kitsu

* [Filters](#filters)
	* [Introduction to filters](#introduction-to-filters)
	* [How Search Bar works](#how-search-bar-work)
	* [How to add Filters](#how-to-add-filters)
	* [What Filters can I create](#what-filters-can-i-create)
	* [How to delete Filters](#how-to-delete-filters)
* [Notifications](#notifications)
	* [How notifications work](#how-notifications-work)
	* [How to get notified](#how-to-get-notified)
	* [How not to be notified anymore](#how-not-to-be-notified-anymore)

* [Playlist](#playlist)
	* [How to create a playlist](#how-to-create-a-playlist)
	* [How to switch from tasks and versions](#how-to-switch-from-tasks-and-versions)
	* [How to delete a playlist](#how-to-delete-a-playlist)

-----------------------------------------	
 
## [Filters](#filters) 
### [Introduction to filters](#introduction-to-filters)

In **Kitsu**, the filters are linked to the **Search bar**. It gives you the opportunity to **save** your search and in a click, get back to it.
 
![Search bar](../img/faq/filter_search_bar.png)

You can find the **Search bar** and the **save** option on different pages : 
* Assets page
* Shots page
* Sequence page

You can find the **Search bar** on a lot of other pages but the main difference will be the lack of the **Save** button next to it ![Search bar](../img/faq/filter_save_button.png).

### [How Search Bar works](#how-search-bar-work)

The **Search bar** uses the autocompletion, so you don't need to type everything to get a prompt result.

For example type the letter `V` and you already get the result of all the assets starting with a V.

![Search bar autocompletion](../img/faq/filter_autocompletion.png)

You can also search some specific **type of asset** : `Props`, `Character`, `Environment`, `Fx` ... The result will display all the assets under this type.

For example, lets search all the **FX** assets. 
	
![Search asset type](../img/faq/filter_asset_type.png)

Another example is to search a specifique **Sequence** on the **Shots page**. You want to see only the shots of the sequence 1 of the first episode.

If you only type `s001` the result will display all the shots of all the episodes which contain sequence 1.

![Search bar sequence episode](../img/faq/filter_ep_seq.png)

To be more specific you need to detail your research : try `e001 s001`.

![Search bar sequence 1 episode 1](../img/faq/filter_ep_seq1.png)

As you can see the result is more accurate.

On the same way, you can search **specific status** link to task. Type the **name of the task** (or the **first letters**), then add the sign **equal** (**=**) and the status you are looking for.

For example, search all the shots which are **Waiting for approval** (**WFA**) at the **Layout** stage. So on the search bar you will type : `layout=wfa` or `lay=wfa`.

![Search layout wfa](../img/faq/filter_lay_wfa.png)

You can be even more specific, lets focus on the first episode : on the search bar add a **space** after the previous search and type `e001`. You can be even more precise and ask to see only the sequence 2. The research will be `lay=wfa e001 s002` or `s002 e001 layout=wfa`.

![Search layout wfa seq2](../img/faq/filter_lay_wfa_s002.png)

### [How to add Filters](#how-to-add-filters)

Kitsu allows you to save your research. You can save them by pressing tne **Enter** key at the end of your typing, or click on the **Save** button ![Save button](../img/faq/filter_save_button.png).

Now under the **Search bar** you can see your previous searches as buttons. 

![Search saved](../img/faq/filter_saved.png)

Everytime you get back to this page, the buttons will be there. It will help you to find the informations you need easier and faster.

### [What Filters can I create](#what-filters-can-i-create)

You can create **filters** about **entities** :
* **Episodes** : `e001`, `e002` etc.  
* **Sequences** : `e001 s001`, `s001 s001` etc.
* **Asset Type** : `characters`, `environment`, `fx` etc.

You can also create **filters** about **task status**: always use **task=status**, you don't have to type all the letter of the task, Kitsu will understand only the first. But the status has to be fully typed.
* Layout is Work in progress (wip) : `layout=wip` or `lay=wip`
* Concept is waiting for approval (wfa) only for the fx : `concept=wfa fx` or `fx con=wfa`
* On episode 2 Layout is wip : `e002 lay=wip` or `layout=wip e002`


### [How to delete Filters](#how-to-delete-filters)

If you have created a **Filter button** by mistake, click on the cross next to it ![Filter delete](../img/faq/filter_delete.png).

The result of the filter will be display, but not the button anymore. Just cancel your research by deleting the text or use the cross next to the search bar ![Search delete](../img/faq/filter_cross_delete.png)

-----------------------------------------

## [Notifications](#notifications)

### [How notifications work](#how-notifications-work)

The notification symbol is the **Bell** button next to your name, top right of the screen.
It's **gray** ![Notification off](../img/faq/notification_icon_off.png) when you don't have a new notification, and **green** ![Notification on](../img/faq/notification_icon_on.png) when you have a new one.

When you click on the **Bell** button, it will open the **Notifications** page.

Ther,e you can see all the changes made on the **Tasks** you are following or assigned. 

![Notification page](../img/faq/notification_page.png)

There is a lot of informations an a notification : 
* (1) the name of the **author**
* (2) the related **entity**
* (3) the related **task**
* (4) the new **status**
* (5) the **attached file**

and (6) the comment.

Each part is a **link** you can use to jump on the information you need. If you click on the **status**, you will jump to the status page of the entity and you can answer right away.

For example, lets assign Jacques to a new task and ask him to work on the asset.

![Notification example 01](../img/faq/notification_example01.png)

Jacques receives immediately a notification, the **Bell** button change color ![Notification on](../img/faq/notification_icon_on.png) , and he can read the new comment.

**All the notifications and comments appear in real time**. No need to refresh to stay up to date.

![Notification example 02](../img/faq/notification_example02.png)

### [How to get notified](#how-to-get-notified)

As an artist you will receive a notification ![Notification on](../img/faq/notification_icon_on.png) as soon as someone change the status of one of your task, or post a comment.

You can also choose to follow specifics tasks. Go into the task page you want to follow : on the **assets** or **shots** pages click onto the status icon.

On the top right side of the page you can see an **Eye** button, next to the **Delete task** button.

![Follow button](../img/faq/notification_other_task.png)

By default you are following all the tasks you are assigned to, on the task page the icon will be **open** ![Notification on](../img/faq/notification_on.png). 

If you want to follow another task, just click on the **crossed eye** button ![Notification off](../img/faq/notification_off.png), it will change, not crossed anymore ![Notification on](../img/faq/notification_on.png) meaning you are now following this task, and will receive notification about it. 

### [How not to be notified anymore](#how-not-to-be-notified-anymore)

If you don't want to follow a task anymore, just click on the **eye** button ![Notification on](../img/faq/notification_on.png) on the task page. He now will be crossed ![Notification off](../img/faq/notification_off.png), meaning you won't receive notifications anymore.


------------------------------------


## [Playlist](#playlist)
### [How to create a playlist](#how-to-create-a-playlist)
You can find the **Playlist** page on the **main menu** ![Main menu](../img/faq/main_button.png) under the **Production** section. 

![Playlist main menu](../img/faq/playlist_main_menu.png)

The **Playlist** page is separated in 3 parts : 
* (1) : you can **create** a playlist, or choose between them
* (3) : Select the **Shots** you want to show.
* (2) : the shots you have selected will appear here.

Start by creating a **Playlist** ![Playlist add button](../img/faq/playlist_add_button.png), You default name will be the date and the hour. You can change the name of the playlist with the **Edit** button ![Edit button](../img/faq/edit_button.png). For example add the name of your department.

Then on the right part, choose wich shots you want to add on your playlist. Start with selecting the **Episode** and the **Sequence** you want. Then click on the shots you want to add.

The shot will appear on the middle part of the screen. For each shot you can choose the **task** you want to see and the **version**.

![Playlist task selection](../img/faq/playlist_task_selection.png)
![Playlist version selection](../img/faq/playlist_version_selection.png)

### [How to switch from tasks and versions](#how-to-switch-from-tasks-and-versions)


### [How to delete a playlist](#how-to-delete-a-playlist)