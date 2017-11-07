import actionTypes from './actionTypes';

function updateTask(task) {
  return {
    type: actionTypes.UPDATE_TASK,
    task,
  };
}

function setTasks(tasks) {
  return {
    type: actionTypes.SET_TASKS,
    tasks,
  };
}

function asyncGetTasks() {
  return {
    type: actionTypes.ASYNC_SET_TASKS,
  };
}

function asyncUpdateTask(task) {
  return {
    type: actionTypes.ASYNC_UPDATE_TASK,
    task,
  };
}

export default {
  updateTask: updateTask,
  setTasks: setTasks,
  asyncGetTasks: asyncGetTasks,
  asyncUpdateTask: asyncUpdateTask,
};
