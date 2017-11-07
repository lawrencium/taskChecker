import _ from 'lodash';
import moment from 'moment';
import actionTypes from './actionTypes';

function reduceTaskActions(state = {}, action) {
  switch (action.type) {
    case actionTypes.UPDATE_TASK:
      return updateTask(_.extend({}, state), action.task);
    case actionTypes.SET_TASKS:
      return _.keyBy(action.tasks, 'id');
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
  reduceTaskActions: reduceTaskActions,
};
