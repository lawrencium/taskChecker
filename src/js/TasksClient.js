import moment from 'moment';
import { assign, flatMap, identity, keyBy, keys } from 'lodash';
import GoogleTasksService from './GoogleTasksService';
import browserIconController from './browserIconController';
import constants from './constants';

const getTasks = (dataHandler) => {
  const currentTime = moment().utcOffset(0, true).toISOString();
  const overdueTasksQuery = {
    showCompleted: false,
    dueMax: currentTime,
  };

  const oneWeekLater = moment(currentTime).add(1, 'weeks').utcOffset(0, true).toISOString();
  const upcomingTaskQuery = {
    showCompleted: false,
    dueMin: currentTime,
    dueMax: oneWeekLater,
  };

  return Promise.all([
    GoogleTasksService.getTasks(overdueTasksQuery, identity),
    GoogleTasksService.getTasks(upcomingTaskQuery, identity),
  ])
    .catch(() => {
      browserIconController.taskCallErrorHandler();
      throw Error('GoogleTasksError: could not retrieve tasks from Google');
    })
    .then((results) => {
      const allTasks = flatMap(results);
      throwIfTaskIdAppearsTwice(allTasks);

      const withAdditionalFields = allTasks.map((task) => {
        return assign({}, task, { taskStatus: mapToTaskStatus(task, currentTime) });
      });

      return dataHandler(withAdditionalFields);
    });
};

const updateTask = (taskToUpdate, updateResponseHandler) => {
  const unmappedTaskStatus = assign({}, taskToUpdate, {
    status: unmapTaskStatus(taskToUpdate),
    completed: undefined,
    taskStatus: undefined,
  });
  return GoogleTasksService.updateTask(unmappedTaskStatus, (updateResponse) => {
    const withAdditionalFields = assign({}, updateResponse, { taskStatus: mapToTaskStatus(updateResponse, moment()) });

    updateResponseHandler(withAdditionalFields);
  });
};

const throwIfTaskIdAppearsTwice = (list) => {
  const idsInList = keys(keyBy(list, 'id'));
  if (list.length && list.length !== idsInList.length) {
    throw Error('Concurrency: same task appeared in both overdue and upcoming list');
  }
};

const mapToTaskStatus = (task, currentTime) => {
  if (task.status === 'completed') {
    return constants.TASK_STATUS.COMPLETED;
  }

  return moment(currentTime).utcOffset(0, true).isSameOrAfter(task.due) ? constants.TASK_STATUS.OVERDUE : constants.TASK_STATUS.UPCOMING;
};

const unmapTaskStatus = (task) => {
  return task.taskStatus === constants.TASK_STATUS.COMPLETED ? 'completed' : 'needsAction';
};

export default {
  getTasks: getTasks,
  updateTask: updateTask,
};
