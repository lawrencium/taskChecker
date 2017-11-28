# Task Checker Chrome Extension

[![Install now.](https://developer.chrome.com/webstore/images/ChromeWebStore_BadgeWBorder_v2_206x58.png)
](https://chrome.google.com/webstore/detail/task-checker/emeajcjikgmcekalbihnnjlbpeaipjjn)

[![Build Status](https://travis-ci.org/lawrencium/taskChecker.svg?branch=master)](https://travis-ci.org/lawrencium/taskChecker)

![screenshot](public/promotional/large_tile.png)


### Easily manage your Google Tasks

Get a button on your browser toolbar that you can click to see overdue and upcoming tasks from Google Tasks, without ever leaving your page.
The button turns red to notify you whenever you have an overdue task.


## Features
![screenshot](public/promotional/screenshot3.png)

#### Browser toolbar button
Get a quick glimpse into your tasks status. A green icon means you don't have any overdue tasks. A red icon means you have an overdue task. It will also display a badge with the number of overdue tasks you need to complete.

#### Popup
Clicking on the toolbar button will open a popup that gives you a window into your tasklist. You'll receive a consolidated view of all your tasks across all your task lists to get a holistic view of your tasks.
* See your overdue and upcoming tasks
* Mark your overdue and upcoming tasks as complete
* Create a new task 

#### Syncing with Google Tasks
This app syncs with the Google API every minute for any updates to your task list. So if you make a change to your task list externally and don't see it reflected in the app, give it a couple minutes to sync with Google. 


## Running the code
1. Make sure you have gulp and npm installed. You'll also need to be able to run `sed`, `jq`, and `mkdir` from the command line.
2. To run the app, you will need to have the environment variables specified in the `config/readme`. For development purposes, you can use the `CLIENT_ID` specified in the `config/readme.md` file  
    * To set an environment variable run the following command in a bash environment:
      > export \<environment key>=\<variable here>
3. `npm install` to install project dependencies
4. `gulp test` to lint & make sure the tests pass
5. `gulp dev` will create a `dist/` folder containing the bundled app that can then be loaded into a Google Chrome browser. Instructions [here](https://developer.chrome.com/extensions/getstarted#unpacked). `gulp dev` will watch your javascript files for changes and automatically update `dist/` with the latest changes -- for HTML changes, you'll have to rerun `gulp dev`
6. `gulp karma-server` will run a Karma server that watches your files for any changes and automatically run the tests when any javascript files have changed

## Deploying the app
1. Make sure the corresponding `key.pem` file is in your `config/` directory.
2. Make sure the `config/config.json` credentials correspond to the expected prod or dev deployment
3. `gulp dist --type {major, minor, patch}` will increment the MAJOR.MINOR.PATCH version in `package.json` and `manifest.json` depending on which type is specified.
4. zip the `dist/` folder and upload to the [Chrome Web Store](https://chrome.google.com/webstore/developer/dashboard). 
