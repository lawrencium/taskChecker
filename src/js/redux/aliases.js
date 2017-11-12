import actions from './actions';
import TasksClient from '../TasksClient';

const asyncSetTasks = () => {
  return (dispatch) => {
    return TasksClient.getTasks((tasks) => {
      return dispatch(actions.setTasks(tasks));
    });
  };
};

const asyncUpdateTask = (originalAction) => {
  const taskToUpdate = originalAction.task;
  return (dispatch) => {
    return TasksClient.updateTask(taskToUpdate, (updateResponse) => {
      dispatch(actions.updateTask(updateResponse));
    });
  };
};

const asyncCreateTask = (originalAction) => {
  return (dispatch) => {
    return TasksClient.createTask(originalAction.task, (createResponse) => {
      dispatch(actions.updateTask(createResponse));
    });
  };
};


export default {
  ASYNC_SET_TASKS: asyncSetTasks,
  ASYNC_UPDATE_TASK: asyncUpdateTask,
  ASYNC_CREATE_TASK: asyncCreateTask,
};
