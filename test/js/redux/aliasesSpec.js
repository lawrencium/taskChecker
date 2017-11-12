import chai from 'chai';
import sinon from 'sinon';
import _ from 'lodash';
import actionTypes from '../../../src/js/redux/actionTypes';
import aliases from '../../../src/js/redux/aliases';
import actions from '../../../src/js/redux/actions';
import TasksClient from '../../../src/js/TasksClient';


const { expect } = chai;


describe('aliases', () => {
  describe(actionTypes.ASYNC_SET_TASKS, () => {
    const getTasksCall = sinon.stub(TasksClient, 'getTasks');

    afterEach(() => {
      getTasksCall.reset();
    });

    it('makes single call to `TasksClient.getTasks`', () => {
      getTasksCall.yields([]);
      aliases.ASYNC_SET_TASKS()(_.noop);

      return expect(getTasksCall.calledOnce).to.be.true;
    });

    describe('on successful TasksClient call', () => {
      it('calls dispatchSpy only once', () => {
        const dispatchSpy = sinon.stub();
        getTasksCall.yields([]);
        aliases.ASYNC_SET_TASKS()(dispatchSpy);

        return expect(dispatchSpy.calledOnce).to.be.true;
      });

      it(`dispatches a ${actionTypes.SET_TASKS} action with all tasks`, () => {
        const dispatchSpy = sinon.stub();
        const overdueTask = { id: 1, title: 'someTasks' };
        const upcomingTask = { id: 2, title: 'upcomingTask' };
        getTasksCall.yields([overdueTask, upcomingTask]);
        aliases.ASYNC_SET_TASKS()(dispatchSpy);

        const expectedAction = actions.setTasks([overdueTask, upcomingTask]);
        return expect(dispatchSpy.calledWith(expectedAction)).to.be.true;
      });
    });
  });

  describe(actionTypes.ASYNC_UPDATE_TASK, () => {
    const updateTaskCall = sinon.stub(TasksClient, 'updateTask');
    const taskToUpdate = { id: 1, title: 'someTaskUpdate' };
    const updateAction = actions.asyncUpdateTask(taskToUpdate);

    afterEach(() => {
      updateTaskCall.reset();
    });

    it('invokes `TasksClient.updateTask` once', () => {
      aliases.ASYNC_UPDATE_TASK({})(_.noop);

      return expect(updateTaskCall.calledOnce).to.be.true;
    });

    it('passes "task" payload in original action', () => {
      aliases.ASYNC_UPDATE_TASK(updateAction)(_.noop);
      return expect(updateTaskCall.calledWith(taskToUpdate)).to.be.true;
    });

    it('does not invoke dispatchSpy outside of callback', () => {
      const dispatchSpy = sinon.stub();
      aliases.ASYNC_UPDATE_TASK({})(dispatchSpy);

      return expect(dispatchSpy.called).to.be.false;
    });

    it('passes in `task` from originalAction', () => {
      const payload = { title: 'someTask' };
      aliases.ASYNC_UPDATE_TASK({ task: payload })(_.noop);
      return expect(updateTaskCall.calledWith(payload)).to.be.true;
    });

    describe('on successful update', () => {
      it('invokes dispatchSpy once', () => {
        const dispatchSpy = sinon.stub();
        const updateResponse = { id: 1, title: 'updated task response' };
        updateTaskCall.yields(updateResponse);

        aliases.ASYNC_UPDATE_TASK(updateAction)(dispatchSpy);
        return expect(dispatchSpy.calledOnce).to.be.true;
      });

      it(`dispatches an ${actionTypes.UPDATE_TASK} action`, () => {
        const dispatchSpy = sinon.stub();
        const updateResponse = { id: 1, title: 'updated task response' };
        updateTaskCall.yields(updateResponse);

        aliases.ASYNC_UPDATE_TASK(updateAction)(dispatchSpy);

        const expectedAction = actions.updateTask(updateResponse);
        return expect(dispatchSpy.calledWith(expectedAction)).to.be.true;
      });
    });
  });

  describe(actionTypes.ASYNC_CREATE_TASK, () => {
    const createTaskCall = sinon.stub(TasksClient, 'createTask');
    const taskToCreate = { id: 1, title: 'someTaskCreate' };
    const createAction = actions.asyncCreateTask(taskToCreate);

    afterEach(() => {
      createTaskCall.reset();
    });

    it('invokes `TasksClient.createTask` once', () => {
      aliases.ASYNC_CREATE_TASK({})(_.noop);
      return expect(createTaskCall.calledOnce).to.be.true;
    });

    it('passes in `task` from originalAction', () => {
      const payload = { title: 'someTask' };
      aliases.ASYNC_CREATE_TASK({ task: payload })(_.noop);
      return expect(createTaskCall.calledWith(payload)).to.be.true;
    });

    it('does not invoke dispatchSpy outside of callback', () => {
      const dispatchSpy = sinon.stub();
      aliases.ASYNC_CREATE_TASK({})(dispatchSpy);

      return expect(dispatchSpy.called).to.be.false;
    });

    describe('on successful create', () => {
      it('invokes dispatchSpy once', () => {
        const dispatchSpy = sinon.stub();
        createTaskCall.yields({});

        aliases.ASYNC_CREATE_TASK(createAction)(dispatchSpy);
        return expect(dispatchSpy.calledOnce).to.be.true;
      });

      it(`dispatches an ${actionTypes.UPDATE_TASK} action`, () => {
        const dispatchSpy = sinon.stub();
        const createResponse = { id: 1, title: 'created task response' };
        createTaskCall.yields(createResponse);

        aliases.ASYNC_CREATE_TASK(createAction)(dispatchSpy);

        const expectedAction = actions.updateTask(createResponse);
        return expect(dispatchSpy.calledWith(expectedAction)).to.be.true;
      });
    });
  });
});
