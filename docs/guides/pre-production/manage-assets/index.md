---
prev:
  text: 'Main UI Concepts'
  link: '/start-here/main-ui-concepts'
next:
  text: 'Manage Concepts'
  link: '/guides/pre-production/manage-concepts'
---

# Managing Assets

## Create an Asset

### Create your first asset

So, now that we have created our production and have a general grasp of the Kitsu interface, it's time to create our first asset.

On the asset page, click on **Add assets**.

![Asset page first time](/img/getting-started/add_assets_first.png)

::: warning
When you create an asset, your task workflow will be applied, and **all the tasks will be created simultaneously as the asset**.
:::

A pop-up window opens:

It asks you to choose the **Asset Type** (1).
If you didn't add a new asset type, Kitsu will provide examples such as Characters, Environment, FX, Props, etc.
Let's start with a character.

::: tip
You can also customize the asset type list and the tasks pipeline. See the guide (
[Customization of the workflow](../../../configure-kitsu/index.html#asset-types)) for more details
:::

We give it a **Name** (2) and enter a description that helps the Artist know what to do and quickly identify the asset.

Click on **Confirm and stay** if you have multiple assets to create.


![Create an asset](/img/getting-started/add_asset_popup.png)

You can change the asset type and keep adding assets.

::: tip
The newly created asset appears in the background whenever you click on **Confirm and stay**.
:::

After adding your last asset, click
on **Confirm**. It will create the asset and close the window.

::: tip
If you click on **Confirm and stay, ** realize you don't have more assets to add, and click on **Close, ** the window will be canceled.
:::

![Global asset page](/img/getting-started/asset_edit.png)

You will also see the tasks that are selected for your assets workflow are created at the same time.


If you need to add more **Assets**, click the **+ Create assets** button.

::: details Create Assets from a CSV Spreadsheet File
You may already have your asset list ready in a spreadsheet file.
With Kitsu, you have two ways to import them; the first is to import a `.csv` file and copy-paste your data directly into Kitsu.

First, save your spreadsheet as a `.csv` file.

Then, go back to the asset page on Kitsu and click on the **Import** icon.
![Import Icon](/img/getting-started/import.png)

A pop-up window **Import data from a CSV** opens. Click on **Browse** to pick your `.csv` file.

![Import csv file](/img/getting-started/import_csv_asset.png)

To see the result, click on the **Preview** button.
 
You can check and adjust the name of the columns by previewing your data.
 
NB: the **Episode** column is only mandatory for a **TV Show** production.
 
![Import data copy paste data](/img/getting-started/import_preview_data.png)

Once everything is good, click the **Confirm** button to import your data into Kitsu.

You have imported all your assets into Kitsu and created the task according to your Settings.

![Import data copy paste data](/img/getting-started/import_result_asset.png)
:::

::: details Create Assets by Copying / Pasting a Spreadsheet File

Open your spreadsheet, select your data, and copy them.

![Import copy data](/img/getting-started/import_copypas_asset.png)

Then, go back to the asset page on Kitsu and click on the **Import** icon
![Import Icon](/img/getting-started/import.png).

A pop-up window **Import data from a CSV** opens; click on the **Paste a CSV data** tab.

![Import data copy paste tab](/img/getting-started/import_pastcsvdata_asset.png)
 
You can paste your previously selected data and see the result with the **Preview** button.
 
![Import data copy paste data](/img/getting-started/import_pastcsvdata2_asset.png)
 
You can check and adjust the name of the columns by previewing your data.
 
NB: the **Episode** column is only mandatory for a **TV Show** production.
 
![Import data copy paste data](/img/getting-started/import_preview_data.png)

Once everything is good, click the **Confirm** button to import your data into Kitsu.

You have imported all your assets into Kitsu and created the task according to your Settings.

![Import data copy paste data](/img/getting-started/import_result_asset.png)
:::

### See the Details of an Asset

To see an asset's detail, click on its name.

![Asset detail](/img/getting-started/asset_detail.png)

A new page opens with the list of the tasks, the assignation, and the status newsfeed on the right.

![Asset detail page](/img/getting-started/asset_detail_page.png)

You can click on the status of each task to open the comment panel and see the history of the comments and the different versions.

![Asset detail page](/img/getting-started/asset_detail_page_panel.png)

You can also access the **Casting**,

![Asset detail casting](/img/getting-started/asset_detail_page_casting.png)

**concept** linked to this asset,

![Asset detail casting](/img/getting-started/asset_detail_page_concept.png)

The **Schedule** is available if you have previously filled out the task type page data. If you have already filled out the data, you can modify them directly here.

![Asset detail casting](/img/getting-started/asset_detail_page_schedule.png)

the **Preview Files** uploaded at various task types,

![Asset detail casting](/img/getting-started/asset_detail_page_file.png)

And the **Timelog** if people have filled out their timesheet on the tasks of this asset.

![Asset detail casting](/img/getting-started/asset_detail_page_timelog.png)

## Add more tasks after creating the assets

If you realize **after** creating the assets that the task is missing, you can still add them.

First, ensure the missing task type is added to the settings page under the task type tab.

Then go back to the asset page and click on **+ Add tasks**

## Update your assets

You can update your assets at any point, change their name and asset type, modify their description, and add any custom information you added to the global page.

You can edit assets by going to the asset page, hovering over the asset you want to modify, and then clicking on the **edit** button
![Edit button](/img/getting-started/edit_button.png) (1) on the right side of
the line.

![Edit an asset](/img/getting-started/asset_edit01.png)

To extend the description on the main asset page, click on the first words (2), and a pop-up with the full description will open.


### Update Assets with the CSV Import

You can use the CSV import to update your data quickly.

You can update the **type** of an asset, the **Assignation**, the **Status** of tasks, and add a **Comment**.

You need to switch on the option **Update existing data**. Then, the lines that will be updated
will be highlighted in blue.

![Import data copy paste data](/img/getting-started/import_update_asset.png)

### Update Assets by Copying / Pasting a Spreadsheet File

Open your spreadsheet, select your data, and copy them.

![Import copy data](/img/getting-started/import_copypas_asset.png)

Then, go back to the asset page on Kitsu and click on the **Import** icon
![Import Icon](/img/getting-started/import.png).

A pop-up window **Import data from a CSV** opens; click on the **Paste a CSV data** tab.

![Import data copy paste tab](/img/getting-started/import_pastcsvdata_asset.png)
 
You can paste your previously selected data and see the result with the **Preview** button.
 
![Import data copy paste data](/img/getting-started/import_pastcsvdata2_asset.png)
 
You can check and adjust the name of the columns by previewing your data.

NB: the **Episode** column is only mandatory for a **TV Show** production.
 
You need to switch on the option **Update existing data**. Then, the lines that will be updated
will be highlighted in blue.

![Import data copy paste data](/img/getting-started/import_update_asset.png)

You have imported all your assets into Kitsu and created the task according to your Settings.

![Import data copy paste data](/img/getting-started/import_result_asset.png)

## Global View of the Assets

As a client, you can go to the global page of the assets with the drop-down menu on top of the screen.

![Client dropdown menu Asset](/img/getting-started/client_dropdown_asset.png)

On the global page, you will be able to see all the statuses of the different steps of the assets.

![Client global page Asset](/img/getting-started/client_global_asset.png)