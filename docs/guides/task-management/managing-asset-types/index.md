# Managing Asset Types

```mermaid
flowchart TD
    ASSET_TYPE -->|categorizes| ASSET
```

## Define Your Asset Workflow

Once you have created your global Workflow, you can then define your **Asset Types**

<!-- #region setup -->

Much like how shots can be organized by a sequence, an asset can be organised by it's **Asset Type**. Think of it as using folders to organize all your assets by category.


On the main menu ![Main menu](/img/getting-started/main_button.png) select the
**Asset Type** page under the **Admin** section.

![Asset type menu](/img/getting-started/menu_asset_type.png)

::: tip
By default, Kitsu provides some example asset types that can be used for a CGI production.
:::

![Asset type default](/img/getting-started/asset_type_default.png)

To create new **Asset Type**, click on the ![Add Asset Types](/img/getting-started/add_asset_types.png) button.

Next, you will need to supply some information about your **Asset Type**, including:

- The name of the asset type
- A workflow for the specific asset type

Different Asset Types will have distinct workflows. For instance, you might have fewer tasks for an Environment compared to a Character, as Environment assets typically don't require Rigging tasks.
 

![Add asset types name](/img/getting-started/add_asset_types_name.png)

When you **create** or **edit** an **Asset Type**, you can add a specific **task type**; if you don't select a specific workflow for this asset type, your production asset workflow will be applied.

However, if you choose specific Task types for this Asset type, only these will be applied to production.

Click on **Confirm** to save your changes.

Your new **Asset Type** is now created in your **Global Library**. It will be available to use when you create your production.

::: tip
At any point during production, you can revisit this section to create additional **Asset Types** as necessary and add them into your workflow.
:::

<!-- #endregion setup -->

## Enabling Specific Asset Types for a Production

On the **Navigation Menu**, choose on the dropdown menu the **Setting**.

![Drop Down menu Setting](/img/getting-started/drop_down_menu_setting.png)

Per default, Kitsu will load the **Asset Types** you have defined when creating the production.

However, you can add or remove specific Asset Types if they are created on the Global Library first.

![Setting Asset type new](/img/getting-started/setting_asset_new.png)

On the **Asset Types** tab, you can choose which **Asset Types** you want to add or remove on this production,
validate your choice with the **add** button.

![Setting Add Asset](/img/getting-started/setting_asset_add.png)

## Update an Asset Type

Go to `Main Menu > Asset Types`:

![update asset type page](/guides/task-management/managing-asset-types/images/0.png)

Hover over the asset type row you wish to select then click the `Edit` icon:

![update asset type button](/guides/task-management/managing-asset-types/images/1.png)

## Remove an Asset Type

To remove an asset type from your studio's Global Library, go to `Main Menu > Asset Types` and hover over the asset type row you wish to select then click the `Delete` icon:

![remove asset type global](/guides/task-management/managing-asset-types/images/2.png)

To remove an asset type from your production library, go to `Production Menu > Settings > Asset Types` and click the `Remove` button to remove the asset type from the list:  

![remove asset type production](/guides/task-management/managing-asset-types/images/3.png)