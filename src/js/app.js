import { wrapStore } from 'react-chrome-redux';
import filter from 'lodash/filter';
import values from 'lodash/values';
import iconController from './browserIconController';
import store from './redux/store';
import actions from './redux/actions';
import constants from './constants';

/* eslint func-names: "off" */
(function () {
  function checkTasks() {
    store.dispatch(actions.asyncGetTasks());
  }

  wrapStore(store, { portName: 'TaskChecker' });

  store.subscribe(() => {
    const currentState = store.getState();
    const overdueTasks = filter(values(currentState), task => task.taskStatus === constants.TASK_STATUS.OVERDUE);
    iconController.handleOverdueTasks(overdueTasks);
  });

  checkTasks();

  chrome.alarms.create('periodicallyCheckTasks', { delayInMinutes: 1, periodInMinutes: 1 });
  chrome.alarms.onAlarm.addListener(() => {
    checkTasks();
  });
}());
