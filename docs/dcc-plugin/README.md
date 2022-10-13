# Installation of the DCCs connectors

#### Pre-requisites

You need to download the connectors-{version}.zip archive in the [releases](https://github.com/cgwire/kitsu-publisher-next/releases/latest). After that, you have to unzip the archive (with right-click "Extract All" on Windows or unzip on Linux/macOS for example).

#### Blender (version>2.80)

- You need to go inside the connectors/blender directory.

- On Windows (with PowerShell):

  - If you want to be guided through the installation of the plugin, you have to right-click on the script install.ps1 and select "Run with PowerShell" to run the script in prompt mode. If you have multiple installations from installer of Blender it will install the plugin for all the installations (not if you select a portable Blender).

  - If you want to run the script with PowerShell command line it's possible, look at the help with:

    ```console
    .\install.ps1 -help
    ```

- On Linux:

  - If Blender is installed with a system package (for example: deb or rpm):

    ```console
    bash ./install.sh --system
    ```

  - If Blender is an unpacked directory (tar.xz archive):

    ```console
    bash ./install.sh --unpacked-directory=PATH_TO_YOUR_PORTABLE_BLENDER
    ```

  - If Blender is installed with a snap package:

    ```console
    bash ./install.sh --snap
    ```

- On macOS:

  - If Blender is installed with a dmg image or Homebrew:

    ```console
    bash ./install.sh --dmg
    ```

#### Toon Boom Harmony

- You need to go inside the connectors/harmony directory.

- On Windows (with PowerShell):

  - If you want to be guided through the installation of the plugin, you have to right-click on the script install.ps1 and select "Run with PowerShell" to run the script in prompt mode. If you have multiple installations from installer of Toon Boom Harmony it will install the plugin for all the installations.

  - If you want to run the script with PowerShell command line it's possible, look at the help with:

    ```console
    .\install.ps1 -help
    ```

- On macOS:

  - coming soon

#### Unreal Editor (version>=5)

- You need to go inside the connectors/unreal directory.

- On Windows (with PowerShell):

  - If you want to be guided through the installation of the plugin, you have to right-click on the script install.ps1 and select "Run with PowerShell" to run the script in prompt mode. If you have multiple installations from installer of Unreal Editor it will install the plugin for all the installations.

  - If you want to run the script with PowerShell command line it's possible, look at the help with:

    ```console
    .\install.ps1 -help
    ```

- On Linux:

  - coming soon

- On macOS:

  - coming soon

