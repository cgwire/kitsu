# Kitsu Publisher

Kitsu is a web application to share the progress of your productions and
validate your deliveries. It improves the communication between all stakeholders.
Which leads to better pictures, shipped faster.

The Kitsu Publisher is a desktop application that connects DCC Tools to Kitsu.
Through it, your artists can see their todo list, comment tasks and send previews to Kitsu
directly from their tools.

## DCC integrations status:

- Blender
- Toon Boom Harmony
- Unreal Engine

Work in progress:

- Photoshop
- Nuke

## Installation

### Installation of the Kitsu Publisher

#### Pre-requisites

You need to download (or to build if you want to: see [Development Environment](#development-environment)) your preferred installer/package/portable for the app corresponding to your OS in the [releases](https://github.com/cgwire/kitsu-publisher-next/releases/latest).

All comands have the keyword {version} in the filenames, you need to replace the version with the current version of the Kitsu Publisher.

#### On Linux

- deb package (for debian based distributions):

  - To install the package:

    ```console
    dpkg -i kitsu-publisher_{version}_amd64.deb
    ```

  - The package is now in your applications and in your $PATH.

- rpm package (for RHEL based distributions):

  - To install the package:

    ```console
    rpm -i kitsu-publisher_{version}_x86_64.rpm
    ```

  - The package is now in your applications and in your $PATH.

- snap package:

  - To install the package:

    ```console
    snap install kitsu-publisher_{version}_amd64.snap --dangerous
    ```

  - The package is now in your applications and in your $PATH.

- tar.gz archive:

  - To extract the archive:

    ```console
    tar -xf kitsu-publisher-{version}.tar.gz
    ```

  - To run the app:

    ```console
    kitsu-publisher-{version}/kitsu-publisher
    ```

- AppImage:

  - to run the app:

    ```console
    ./Kitsu publisher-{version}.AppImage
    ```

#### On Windows

- NSIS Installer:

  - Double-click on the installer (Kitsu-publisher-Setup-{version}.exe) and follow the instructions.

  - The package is now in your applications.

- Msi installer:

  - Double-click on the installer (Kitsu-publisher-{version}-ia32.msi) and it will install directly the app.

  - The package is now in your applications.

- Portable application:

  - Double-click on the executable (Kitsu-publisher-{version}.exe) to run the app.

- Zip portable application:

  - Extract the zip (Kitsu-publisher-{version}-ia32-win.zip) by right-clicking and select "Extract All" and then follow the instructions.

  - Double click on the executable (Kitsu publisher.exe) inside the extracted folder to run the app.

#### On macOS

- DMG installer:
  
  - Double-click on the installer (Kitsu-publisher-{version}.dmg), a window should open.

  - Drag and drop the Kitsu logo on the "Applications" folder and it will install directly the app.

- PKG installer:

  - To install the package (you can also install the package by double-clicking on it and following the instructions):

    ```console
    sudo installer -package Kitsu-publisher-{version}.pkg -target /
    ```

- Zip portable application:

  - Double-click on the zip (Kitsu-publisher-{version}-mac.zip) to expand the zip.
 
  - Double-click on the Kitsu publisher icon it will launch the app.
  
  
## Development Environment

### Pre-requisites

To develop or to build the Electron app you need [Node.js](https://nodejs.org/en/)>=16.11 installed.

### Dependencies

To install all the dependencies needed by the Electron app you have to run in the project folder:

```console
npm install
```

### Run

To run the Electron app in development mode you have to run an npm script:

```console
npm run dev
```

It will spawn an electron instance and a Vite development server.

### Build the electron app

#### Pre-requisites

- On debian based Linux you need:

  - To install these packages:

    ```console
    apt-get install build-essential libcairo2-dev libpango1.0-dev \
    libjpeg-dev libgif-dev librsvg2-dev
    ```

  - If you want to build specific target like rpm you need to install:

    ```console
    apt-get install rpm
    ```

- On Windows you need:

  - See the [wiki](https://github.com/Automattic/node-canvas/wiki/Installation:-Windows) of node-canvas.

- On macOS you need (with [Homebrew](https://brew.sh/)):

  ```console
  brew install pkg-config cairo pango libpng jpeg giflib librsvg
  ```

#### Building the app

You need to run npm scripts:

- If you only want to build an unpackaged directory:

  ```console
  npm run build
  ```

- If you want to build for all targets:

  ```console
  npm run build:all
  ```
