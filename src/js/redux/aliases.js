import actions from './actions';
import GoogleTasksService from '../GoogleTasksService';
import browserIconController from '../browserIconController';

const asyncUpsertOverdueTasks = () => {
  return (dispatch) => {
    return GoogleTasksService.getOverdueTasks((overdueTasks) => {
      return dispatch(actions.upsertOverdueTasks(overdueTasks));
    }, browserIconController.overdueTaskCountErrorHandler);
  };
};

const asyncUpsertOverdueTask = (originalAction) => {
  const taskToUpsert = originalAction.task;
  return (dispatch) => {
    return GoogleTasksService.upsertTask(taskToUpsert, (upsertResponse) => {
      dispatch(actions.upsertOverdueTask(upsertResponse));
    });
  };
};

export default {
  ASYNC_UPSERT_OVERDUE_TASKS: asyncUpsertOverdueTasks,
  ASYNC_UPSERT_OVERDUE_TASK: asyncUpsertOverdueTask,
};
