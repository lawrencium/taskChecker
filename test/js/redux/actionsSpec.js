import chai from 'chai';
import actionTypes from '../../../src/js/redux/actionTypes';
import actions from '../../../src/js/redux/actions';

const { expect } = chai;

describe('actions', () => {
  describe(actionTypes.UPSERT_OVERDUE_TASK, () => {
    it('has the correct type', () => {
      expect(actions.upsertOverdueTask()).to.have.property('type', 'UPSERT_OVERDUE_TASK');
    });

    it('sets the task', () => {
      const task = { param1: 'blah', param2: 'blahblah' };
      expect(actions.upsertOverdueTask(task)).to.have.deep.property('task', task);
    });
  });

  describe(actionTypes.UPSERT_OVERDUE_TASKS, () => {
    it('has the correct type', () => {
      expect(actions.upsertOverdueTasks()).to.have.property('type', 'UPSERT_OVERDUE_TASKS');
    });

    it('has "tasks" payload', () => {
      const task1 = { param1: 'blah', param2: 'blahblah' };
      const task2 = { param1: 'boo', param2: 'booboo' };
      const expected = [task1, task2];
      expect(actions.upsertOverdueTasks([task1, task2])).to.have.deep.property('tasks', expected);
    });
  });

  describe(actionTypes.REFRESH_OVERDUE_TASKS, () => {
    it('has the correct type', () => {
      expect(actions.refreshOverdueTasks()).to.have.property('type', 'REFRESH_OVERDUE_TASKS');
    });
  });

  describe(actionTypes.ASYNC_UPSERT_OVERDUE_TASKS, () => {
    it('has the correct type', () => {
      expect(actions.asyncUpsertOverdueTasks()).to.have.property('type', 'ASYNC_UPSERT_OVERDUE_TASKS');
    });
  });

  describe(actionTypes.ASYNC_UPSERT_OVERDUE_TASK, () => {
    it('has the correct type', () => {
      expect(actions.asyncUpsertOverdueTask()).to.have.property('type', 'ASYNC_UPSERT_OVERDUE_TASK');
    });

    it('has the "task" payload', () => {
      const payload = { id: 1, title: 'someTaskToUpsert' };
      expect(actions.asyncUpsertOverdueTask(payload)).to.have.deep.property('task', payload);
    });
  });
});
