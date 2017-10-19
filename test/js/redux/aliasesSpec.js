import chai from 'chai';
import sinon from 'sinon';
import _ from 'lodash';
import actionTypes from '../../../src/js/redux/actionTypes';
import GoogleTasksService from '../../../src/js/GoogleTasksService';
import aliases from '../../../src/js/redux/aliases';
import actions from '../../../src/js/redux/actions';
import browserIconController from '../../../src/js/browserIconController';


const { expect } = chai;


describe('aliases', () => {
  describe(actionTypes.ASYNC_UPSERT_OVERDUE_TASKS, () => {
    const getOverdueTasksCall = sinon.stub(GoogleTasksService, 'getOverdueTasks');

    afterEach(() => {
      getOverdueTasksCall.reset();
    });

    it('makes a call to `GoogleTasksService.getOverdueTasks`', () => {
      aliases.ASYNC_UPSERT_OVERDUE_TASKS()(_.noop);
      return expect(getOverdueTasksCall.calledOnce).to.be.true;
    });

    describe('on successful GoogleTasksService call', () => {
      it('calls dispatchSpy only once', () => {
        const dispatchSpy = sinon.stub();
        getOverdueTasksCall.yields([{ id: 1, title: 'someTasks' }]);
        aliases.ASYNC_UPSERT_OVERDUE_TASKS()(dispatchSpy);

        return expect(dispatchSpy.calledOnce).to.be.true;
      });

      it(`dispatches an ${actionTypes.UPSERT_OVERDUE_TASKS} action`, () => {
        const dispatchSpy = sinon.stub();
        const overdueTasks = [{ id: 1, title: 'someTasks' }];
        getOverdueTasksCall.yields(overdueTasks);
        aliases.ASYNC_UPSERT_OVERDUE_TASKS()(dispatchSpy);

        const expectedAction = actions.upsertOverdueTasks(overdueTasks);
        return expect(dispatchSpy.calledWith(expectedAction)).to.be.true;
      });
    });

    describe('on unsuccessful GoogleTasksService call', () => {
      it('does not call dispatchSpy', () => {
        const dispatchSpy = sinon.stub();
        getOverdueTasksCall.callsArg(1);
        aliases.ASYNC_UPSERT_OVERDUE_TASKS()(dispatchSpy);

        return expect(dispatchSpy.called).to.be.false;
      });

      it('calls `overdueTaskCountErrorHandler`', () => {
        const browserIconControllerCall = sinon.stub(browserIconController, 'overdueTaskCountErrorHandler');
        getOverdueTasksCall.callsArg(1);
        aliases.ASYNC_UPSERT_OVERDUE_TASKS()(_.noop);

        return expect(browserIconControllerCall.called).to.be.true;
      });
    });
  });

  describe(actionTypes.ASYNC_UPSERT_OVERDUE_TASK, () => {
    const upsertTaskCall = sinon.stub(GoogleTasksService, 'upsertTask');
    const taskToUpsert = { id: 1, title: 'someTaskUpsert' };
    const upsertAction = actions.asyncUpsertOverdueTask(taskToUpsert);

    afterEach(() => {
      upsertTaskCall.reset();
    });

    it('makes a call to `GoogleTasksService.upsertTask`', () => {
      aliases.ASYNC_UPSERT_OVERDUE_TASK({})(_.noop);

      return expect(upsertTaskCall.calledOnce).to.be.true;
    });

    it('passes "task" payload in original action', () => {
      aliases.ASYNC_UPSERT_OVERDUE_TASK(upsertAction)(_.noop);
      return expect(upsertTaskCall.calledWith(taskToUpsert)).to.be.true;
    });

    it('does not invoke dispatchSpy on unsuccessful upsert', () => {
      const dispatchSpy = sinon.stub();
      aliases.ASYNC_UPSERT_OVERDUE_TASK({})(dispatchSpy);

      return expect(dispatchSpy.called).to.be.false;
    });

    describe('on successful upsert', () => {
      it('invokes dispatchSpy once', () => {
        const dispatchSpy = sinon.stub();
        const upsertResponse = { id: 1, title: 'upserted task response' };
        upsertTaskCall.yields(upsertResponse);

        aliases.ASYNC_UPSERT_OVERDUE_TASK(upsertAction)(dispatchSpy);
        return expect(dispatchSpy.calledOnce).to.be.true;
      });

      it(`dispatches an ${actionTypes.UPSERT_OVERDUE_TASK} action`, () => {
        const dispatchSpy = sinon.stub();
        const upsertResponse = { id: 1, title: 'upserted task response' };
        upsertTaskCall.yields(upsertResponse);

        aliases.ASYNC_UPSERT_OVERDUE_TASK(upsertAction)(dispatchSpy);

        const expectedAction = actions.upsertOverdueTask(upsertResponse);
        return expect(dispatchSpy.calledWith(expectedAction)).to.be.true;
      });
    });
  });
});
