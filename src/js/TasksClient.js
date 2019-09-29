import moment from 'moment';
import { assign, flatMap, identity, keyBy, keys } from 'lodash';
import GoogleTasksService from './GoogleTasksService';
import browserIconController from './browserIconController';
import constants from './constants';

const getTasks = (dataHandler) => {
  const thisMoment = moment();

  const oneMonthLater = moment(thisMoment).add(1, 'months').utcOffset(0, true).toISOString();
  const incompleteTasksDueByNextMonth = {
    showCompleted: false,
    dueMax: oneMonthLater,
  };

  return Promise.all([
    GoogleTasksService.getTasks(incompleteTasksDueByNextMonth, identity),
  ])
    .catch(() => {
      browserIconController.taskCallErrorHandler();
      throw Error('GoogleTasksError: could not retrieve tasks from Google');
    })
    .then((results) => {
      const allTasks = flatMap(results);
      throwIfTaskIdAppearsTwice(allTasks);

      const withAdditionalFields = allTasks.map((task) => {
        return assign({}, task, { taskStatus: mapToTaskStatus(task, thisMoment) });
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

const createTask = (taskToCreate, createResponseHandler) => {
  return GoogleTasksService.createTask(taskToCreate, (createResponse) => {
    const withAdditionalFields = assign({}, createResponse, { taskStatus: mapToTaskStatus(createResponse, moment()) });

    createResponseHandler(withAdditionalFields);
  });
};

const throwIfTaskIdAppearsTwice = (list) => {
  const idsInList = keys(keyBy(list, 'id'));
  if (list.length && list.length !== idsInList.length) {
    throw Error(`Concurrency: same task appeared in both overdue and upcoming list. Task IDs: ${list.map(elem => elem.id)}`);
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
  createTask: createTask,
};
