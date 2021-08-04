# TS.PIXI_template

## PIXI Typescript powered Progressive Web App template

### Features

- HTML container with fullscreen, preload and FPS display functionallity.
- Built in and integrated Service Worker and Web Manifest to enable PWA.
- A convenient build and watch procedures to compile your typescript code.
- Event dispatcher to allow communication between the TS/PIXI application part and the main HTML container.

### Usage

You can create a new repository by clicking the green "Use this template" button.

`git clone --depth=1 --branch=master https://github.com/foumart/TS.PIXI_template.git`

`rm -r -force ./TS.PIXI_template/.git`

### Setup

`npm install` - installs all npm packages needed for build. The *node_modules* folder will occupy around 350mb of disk space.

### Commands:

-   `npm run build` - builds for production into `./dist/`
-   `npm run start` - builds for development into `./dev/` running at *localhost:8080* and starts watching for file changes in `./src/app/`.
-   `npm run check` - start eslint and prettier code checking procedure.
