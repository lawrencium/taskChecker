import actionTypes from './actionTypes';

function upsertOverdueTask(task) {
  return {
    type: actionTypes.UPSERT_OVERDUE_TASK,
    task,
  };
}

function upsertOverdueTasks(tasks) {
  return {
    type: actionTypes.UPSERT_OVERDUE_TASKS,
    tasks,
  };
}

function refreshOverdueTasks() {
  return {
    type: actionTypes.REFRESH_OVERDUE_TASKS,
  };
}

function asyncUpsertOverdueTasks() {
  return {
    type: actionTypes.ASYNC_UPSERT_OVERDUE_TASKS,
  };
}

function asyncUpsertOverdueTask(task) {
  return {
    type: actionTypes.ASYNC_UPSERT_OVERDUE_TASK,
    task,
  };
}

export default {
  upsertOverdueTask: upsertOverdueTask,
  upsertOverdueTasks: upsertOverdueTasks,
  refreshOverdueTasks: refreshOverdueTasks,
  asyncUpsertOverdueTasks: asyncUpsertOverdueTasks,
  asyncUpsertOverdueTask: asyncUpsertOverdueTask,
};
