import { wrapStore } from 'react-chrome-redux';
import _ from 'lodash';
import iconController from './browserIconController';
import store from './redux/store';
import actions from './redux/actions';

/* eslint func-names: "off" */
(function () {
  function checkTasks() {
    store.dispatch(actions.asyncUpsertOverdueTasks());
  }

  wrapStore(store, { portName: 'TaskChecker' });

  store.subscribe(() => {
    const currentState = store.getState();
    const overdueTasks = _.filter(_.values(currentState), task => _.isEqual(task.status, 'needsAction'));
    iconController.handleOverdueTasks(overdueTasks);
  });

  checkTasks();

  chrome.alarms.create('periodicallyCheckTasks', { delayInMinutes: 1, periodInMinutes: 1 });
  chrome.alarms.onAlarm.addListener(() => {
    checkTasks();
  });
}());
