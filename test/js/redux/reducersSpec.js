import chai from 'chai';
import _ from 'lodash';
import moment from 'moment';
import actionTypes from '../../../src/js/redux/actionTypes';
import reducers from '../../../src/js/redux/reducers';
import actions from '../../../src/js/redux/actions';

const { expect } = chai;

describe('reducers', () => {
  const momentInTime = moment('2017-11-20');
  const oneMinuteLater = moment(momentInTime).add(1, 'minute');
  const taskId = 101;
  const task = {
    id: taskId,
    param1: 'blah',
    param2: 23,
    updated: oneMinuteLater.toISOString(),
  };
  describe(actionTypes.UPSERT_OVERDUE_TASK, () => {
    it('on undefined state, returns state with single task', () => {
      const updateAction = actions.upsertOverdueTask(task);
      const newState = reducers.overdueTasks(undefined, updateAction);
      expect(newState).to.eql({ 101: task });
    });

    it('returns new state and does not mutate current state', () => {
      const startingState = { 101: task };
      const updateAction = actions.upsertOverdueTask({ a: 'new task', updated: oneMinuteLater.toISOString() });
      const newState = reducers.overdueTasks(startingState, updateAction);

      expect(newState).to.not.equal(startingState);
    });

    it('does not modify tasks outside of the tree', () => {
      const startingState = { 101: task };
      const updateAction = actions.upsertOverdueTask({ id: 102, a: 'new task', updated: oneMinuteLater.toISOString() });
      const newState = reducers.overdueTasks(startingState, updateAction);

      expect(_.omit(newState, 102)).to.eql(startingState);
    });

    it('replaces existing task if task in action has more recent update time', () => {
      const startingState = { 101: task };
      const updated = { id: 101, a: 'new task', updated: oneMinuteLater.toISOString() };
      const updateAction = actions.upsertOverdueTask(updated);
      const newState = reducers.overdueTasks(startingState, updateAction);

      expect(newState).to.have.deep.property(101, updated);
    });

    it('does not replace existing task if existing task has more recent update time', () => {
      const startingState = { 101: task };
      const updated = { id: 101, a: 'new task', updated: momentInTime.toISOString() };
      const updateAction = actions.upsertOverdueTask(updated);
      const newState = reducers.overdueTasks(startingState, updateAction);

      expect(newState).to.eql(startingState);
    });

    it('returns original state on unknown action type', () => {
      const startingState = { 101: task };
      const newState = reducers.overdueTasks(startingState, { type: 'unknown' });

      expect(startingState).to.equal(newState);
    });
  });

  describe(actionTypes.UPSERT_OVERDUE_TASKS, () => {
    const anotherTask = {
      id: taskId + 1,
      updated: momentInTime.toISOString(),
      title: 'soooo updated',
    };

    it('on undefined state, returns state with all tasks', () => {
      const updateAction = actions.upsertOverdueTasks([task, anotherTask]);
      const newState = reducers.overdueTasks(undefined, updateAction);
      const expectedState = {
        101: task,
        102: anotherTask,
      };
      expect(newState).to.eql(expectedState);
    });

    it('only updates tasks with outdated update times', () => {
      const startingState = { 101: task, 102: anotherTask };
      const shouldNotUpdate = _.assign({}, task, { updated: momentInTime.toISOString() });
      const shouldUpdate = _.assign({}, anotherTask, { updated: oneMinuteLater.toISOString() });
      const action = actions.upsertOverdueTasks([shouldNotUpdate, shouldUpdate]);
      const newState = reducers.overdueTasks(startingState, action);
      expect(newState).to.have.deep.property(101, task);
      expect(newState).to.have.deep.property(102, shouldUpdate);
    });
  });

  describe(actionTypes.REFRESH_OVERDUE_TASKS, () => {
    it('removes tasks with status `completed`', () => {
      const startingState = { 101: _.assign({}, task, { status: 'completed' }) };
      expect(reducers.overdueTasks(startingState, actions.refreshOverdueTasks())).to.be.empty;
    });

    it('does not remove tasks with status `needsAction`', () => {
      const startingState = { 101: _.assign({}, task, { status: 'needsAction' }) };
      expect(reducers.overdueTasks(startingState, actions.refreshOverdueTasks())).to.eql(startingState);
    });
  });
});
