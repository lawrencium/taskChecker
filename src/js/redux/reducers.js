import _ from 'lodash';
import moment from 'moment';
import actionTypes from './actionTypes';

function overdueTasks(state = {}, action) {
  switch (action.type) {
    case actionTypes.UPSERT_OVERDUE_TASK:
      return updateTask(_.extend({}, state), action.task);
    case actionTypes.UPSERT_OVERDUE_TASKS:
      return _.reduce(action.tasks, updateTask, _.extend({}, state));
    case actionTypes.REFRESH_OVERDUE_TASKS: {
      const mutableState = _.extend({}, state);
      _.forEach(mutableState, (task, taskId) => {
        if (_.isEqual(task.status, 'completed')) {
          delete mutableState[taskId];
        }
      });
      return mutableState;
    }
    default:
      return state;
  }
}

function updateTask(mutableState, task) {
  const { id: taskId } = task;

  const lastTimeTaskWasUpdated = _.get(mutableState, `${taskId}.updated`);
  if (lastTimeTaskWasUpdated && moment(lastTimeTaskWasUpdated).isAfter(task.updated)) {
    return mutableState;
  }

  mutableState[taskId] = task; // eslint-disable-line no-param-reassign
  return mutableState;
}

export default {
  overdueTasks: overdueTasks,
};
