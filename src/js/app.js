import * as googleTasksService from './googleTasksService';
import * as browserIconController from './browserIconController';

(function () {
  function checkTasks() {
    googleTasksService.getOverdueTaskCount(browserIconController.handleOverdueTaskCount);
  }

  checkTasks();

  chrome.alarms.create('periodicallyCheckTasks', {delayInMinutes: 1, periodInMinutes: 1});
  chrome.alarms.onAlarm.addListener(function () {
    checkTasks();
  });

  chrome.browserAction.onClicked.addListener(function () {
    checkTasks();
    chrome.tabs.create({url: 'https://mail.google.com/tasks/canvas'});
  });
}());