import chai from 'chai';
import actionTypes from '../../../src/js/redux/actionTypes';
import actions from '../../../src/js/redux/actions';

const { expect } = chai;

describe('actions', () => {
  describe(actionTypes.UPDATE_TASK, () => {
    it('has the correct type', () => {
      expect(actions.updateTask()).to.have.property('type', 'UPDATE_TASK');
    });

    it('sets the task', () => {
      const task = { param1: 'blah', param2: 'blahblah' };
      expect(actions.updateTask(task)).to.have.deep.property('task', task);
    });
  });

  describe(actionTypes.SET_TASKS, () => {
    it('has the correct type', () => {
      expect(actions.setTasks()).to.have.property('type', 'SET_TASKS');
    });

    it('has "tasks" payload', () => {
      const task1 = { param1: 'blah', param2: 'blahblah' };
      const task2 = { param1: 'boo', param2: 'booboo' };
      const expected = [task1, task2];
      expect(actions.setTasks([task1, task2])).to.have.deep.property('tasks', expected);
    });
  });

  describe(actionTypes.ASYNC_SET_TASKS, () => {
    it('has the correct type', () => {
      expect(actions.asyncGetTasks()).to.have.property('type', 'ASYNC_SET_TASKS');
    });
  });

  describe(actionTypes.ASYNC_UPDATE_TASK, () => {
    it('has the correct type', () => {
      expect(actions.asyncUpdateTask()).to.have.property('type', 'ASYNC_UPDATE_TASK');
    });

    it('has the "task" payload', () => {
      const payload = { id: 1, title: 'someTaskToUpsert' };
      expect(actions.asyncUpdateTask(payload)).to.have.deep.property('task', payload);
    });
  });

  describe(actionTypes.ASYNC_CREATE_TASK, () => {
    it('has the correct type', () => {
      expect(actions.asyncCreateTask()).to.have.property('type', 'ASYNC_CREATE_TASK');
    });

    it('has `task` payload', () => {
      const payload = { title: 'someTaskToUpsert', param: 'something else' };
      expect(actions.asyncCreateTask(payload)).to.have.property('task', payload);
    });
  });
});
