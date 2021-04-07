# Filters

## Introduction to filters

In **Kitsu**, the filters are set through the **search bar**. It allows you to
**save** your search query. Once done, you can rerun your query with a
simple click.
 
![Search bar](../img/getting-started/filter_search_bar.png)

You can find the **search bar** and the **save** option ![Search
bar](../img/getting-started/filter_save_button.png). in the following pages: 

* Assets
* Shots
* Sequences
* Todo-lists

NB: The **search bar** is available too in people episodes list.

## How to use the Filter Builder?

Next to the search bar you have the icon of the **Filter Builder**

![Filter Builder](../img/getting-started/filter_builder.png)

When you click on it a pop up opened, and gives you several choices for your filtering; 

![Filter Builder option](../img/getting-started/filter_builder_option.png)

You can filter per **Status** on a **Task Type**, you can also filter through the custom column 
[Filter Builder option](../img/getting-started/#add-custom-columns)

You can also filter the global page through the assignation, per artist or per the lack of assignation.

And finally you can filter per the Thumbnails presence.

You can add several filters. Once you are done, validate your choice with the **Confirm"" button.


## How to use the search bar?

The **search bar** query is applied every time a new character is typed. You
don't need to type everything to get a quick result.

For example, in the assets page, type the letters `Ot` and you get the
result of all the assets starting with an `Ot`.  

![Search bar result](../img/getting-started/filter_autocompletion.png)

You can also search for some specific **type of asset**: `Props`, `Character`,
`Environment`, `Fx` ... The result displays all the assets from this type.

For example, let's search all the **FX** assets. 
    
![Search asset type](../img/getting-started/filter_asset_type.png)

Another example gets **shots page** of a specific **sequence**.
Ex: see only the shots of the second sequence of the first episode.

Select the first episode on the drop-down menu, then search `sq002`, the result
 gets all the shots of all the episodes from sequence 2.

![Search bar sequence episode](../img/getting-started/filter_ep_seq.png)

In the same way, you can search **specific status** link to the task. Type the
**name of the task** (or between `[` `]` if the task name is more than one word `[modeling low]`),
 then add the sign **equal**
(`=`) also, the **status** you are looking.

For example, search all the shots which are **Waiting for approval** ![WFA](../img/getting-started/wfa_icon.png)
at the **Animation** stage. So on the search bar, you type: `animation=wfa`.

![Search layout wfa](../img/getting-started/filter_lay_wfa.png)

You can be even more specific, let's focus on the shots that are still on retake at the animation stage, and already started at the render stage: on the search
bar add a **space** after the previous search and type `render=wip`. 
The research is `animation=wfa render=wip`.

![Search layout wfa seq2](../img/getting-started/filter_lay_wfa_s002.png)

You can also search for an **assigned** or **unassigned** task for a specific type of task.
For example `Animation = unassigned`, `modeling=assigned`.

## How to save filter queries?

Kitsu allows you to save your research. You can save them by pressing the
**Enter**, or click on the **Save** button 
![Save button](../img/getting-started/filter_save_button.png).

Now under the **search bar** you can see your saved queries as buttons. 

![Search saved](../img/getting-started/filter_saved.png)

Every time you get back to this page, the buttons are there. It helps
you to run common queries faster.

## What filters can I create?

You can create **filters** about **entities**:

* **Sequences** : `se01`, `se02` etc. or exclude : `-se01`, `-se02` etc.
* **Asset Type** : `characters`, `environment`, `fx` etc. or exclude `-characters`, `-fx`, etc.

You can also create **filters** about **task status** by following this syntax:
**task=status**.

Examples:

* Layout is work in progress (wip) : `layout=wip`
* Concept is waiting for approval (wfa) only for the fx : `concept=wfa fx`
* On sequence 2 Layout is wip : `se02 layout=wip`
* Animation is Retake and Render is waiting for approval (wfa) `animation=retake render=wfa`.



### How to delete filters?

If you have created a **filter button** by mistake, click on the cross next to
it ![Filter delete](../img/getting-started/filter_delete.png).

The result of the filter is displayed, but not the button anymore. Just
cancel your research by deleting the text or use the cross next to the search
bar ![Search delete](../img/getting-started/filter_cross_delete.png)

### How to rename filters?

If you have created a **filter button** but the code displayed is too long,
or not clear enough, you can rename it. Click on the edit button next to
it ![Filter edit](../img/getting-started/filter_edit.png).

