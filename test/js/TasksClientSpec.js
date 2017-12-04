import chai from 'chai';
import sinon from 'sinon';
import noop from 'lodash/noop';
import assign from 'lodash/assign';
import moment from 'moment';

import TasksClient from '../../src/js/TasksClient';
import GoogleTasksService from '../../src/js/GoogleTasksService';
import browserIconController from '../../src/js/browserIconController';
import constants from '../../src/js/constants';

const { expect } = chai;
chai.use(require('chai-as-promised'));

const currentFakeTime = '2017-12-19T09:00:00.000Z';
const clock = sinon.useFakeTimers(moment(currentFakeTime).valueOf());
after(() => {
  clock.restore();
});

describe('TasksClientSpec', () => {
  describe('getTasks()', () => {
    let getTasksCall;
    before(() => {
      getTasksCall = sinon.stub(GoogleTasksService, 'getTasks');
    });

    afterEach(() => {
      getTasksCall.reset();
    });

    describe('successful tasks call', () => {
      beforeEach(() => {
        getTasksCall.returns(Promise.resolve([]));
      });

      it('calls dataHandlerSpy once', () => {
        const dataHandlerSpy = sinon.spy();

        return TasksClient.getTasks(dataHandlerSpy)
          .then(() => {
            return expect(dataHandlerSpy.calledOnce).to.be.true;
          });
      });

      describe('calls GoogleTasksService.getTasks()', () => {
        it('for overdue tasks', () => {
          TasksClient.getTasks(noop);

          return expect(getTasksCall.calledWith({
            showCompleted: false,
            dueMax: currentFakeTime,
          })).to.be.true;
        });

        it('for upcoming tasks', () => {
          TasksClient.getTasks(noop);

          const oneMonthLater = '2018-01-19T09:00:00.000Z';
          return expect(getTasksCall.calledWith({
            showCompleted: false,
            dueMin: currentFakeTime,
            dueMax: oneMonthLater,
          })).to.be.true;
        });

        it('twice', () => {
          TasksClient.getTasks(noop);

          return expect(getTasksCall.calledTwice).to.be.true;
        });
      });

      describe('yields list of tasks', () => {
        it('that is empty if no overdue tasks and no upcoming tasks', () => {
          getTasksCall.returns(Promise.resolve([]));
          const dataHandlerSpy = sinon.spy();

          TasksClient.getTasks(dataHandlerSpy);

          return TasksClient.getTasks(dataHandlerSpy)
            .then(() => {
              return expect(dataHandlerSpy.calledWith([])).to.be.true;
            });
        });

        it('containing overdue and upcoming tasks with mapped constants.TASK_STATUS', () => {
          const beforeCurrentTime = '2017-12-18T09:00:00.000Z';
          const afterCurrentTime = '2017-12-20T09:00:00.000Z';

          const firstTask = { id: 1, title: 'aTask', due: beforeCurrentTime };
          const secondTask = { id: 2, title: 'anotherTask', due: afterCurrentTime };
          getTasksCall
            .onFirstCall().returns(Promise.resolve([firstTask]))
            .onSecondCall().returns(Promise.resolve([secondTask]));
          const dataHandlerSpy = sinon.spy();

          const expectedFirstTask = assign({}, firstTask, { taskStatus: constants.TASK_STATUS.OVERDUE });
          const expectedSecondTask = assign({}, secondTask, { taskStatus: constants.TASK_STATUS.UPCOMING });

          return TasksClient.getTasks(dataHandlerSpy)
            .then(() => {
              return expect(dataHandlerSpy.calledWith([expectedFirstTask, expectedSecondTask])).to.be.true;
            });
        });
      });

      describe('concurrency workaround', () => {
        it('throws an exception if a task id is in both overdue and upcoming tasks', () => {
          const someTask = { id: 1, title: 'someTask' };
          const sameTask = { id: 1, title: 'someTask' };
          getTasksCall
            .onFirstCall().returns(Promise.resolve([someTask]))
            .onSecondCall().returns(Promise.resolve([sameTask]));

          return expect(TasksClient.getTasks(noop)).to.be.rejectedWith(Error, /Concurrency/);
        });

        it('does not call dataHandlerSpy', () => {
          const someTask = { id: 1, title: 'someTask' };
          const sameTask = { id: 1, title: 'someTask' };
          getTasksCall
            .onFirstCall().returns(Promise.resolve([someTask]))
            .onSecondCall().returns(Promise.resolve([sameTask]));
          const dataHandlerSpy = sinon.spy();

          return TasksClient.getTasks(dataHandlerSpy).catch(() => {
            return expect(dataHandlerSpy.notCalled).to.be.true;
          });
        });
      });
    });

    describe('unsuccessful tasks call', () => {
      const taskCallErrorHandler = sinon.stub(browserIconController, 'taskCallErrorHandler');

      beforeEach(() => {
        taskCallErrorHandler.reset();
      });

      it('calls browserIconController.taskCallErrorHandler()', () => {
        getTasksCall.returns(Promise.reject(new Error('failed task call')));


        return TasksClient.getTasks(noop).catch(() => {
          return expect(taskCallErrorHandler.calledOnce).to.be.true;
        });
      });

      it('does not call dataHandlerSpy', () => {
        getTasksCall.returns(Promise.reject(new Error('failed task call')));
        const dataHandlerSpy = sinon.spy();

        return TasksClient.getTasks(dataHandlerSpy).catch(() => {
          return expect(dataHandlerSpy.notCalled).to.be.true;
        });
      });
    });
  });

  describe('updateTask()', () => {
    let updateTaskCall;
    before(() => {
      updateTaskCall = sinon.stub(GoogleTasksService, 'updateTask');
    });

    afterEach(() => {
      updateTaskCall.reset();
    });

    describe('calls `GoogleTasksService.updateTask()`', () => {
      it('once', () => {
        TasksClient.updateTask({}, noop);

        return expect(updateTaskCall.calledOnce).to.be.true;
      });

      describe('with expected properties', () => {
        it('"task.status" = "completed" if "taskStatus"=COMPLETED', () => {
          const update = { id: 1, title: 'some update', taskStatus: constants.TASK_STATUS.COMPLETED };

          TasksClient.updateTask(update, noop);

          return expect(updateTaskCall.calledWithMatch({ status: 'completed' })).to.be.true;
        });

        it('"task.status" = "needsAction" if "taskStatus" is not COMPLETED', () => {
          const update = { id: 1, title: 'some update', taskStatus: constants.TASK_STATUS.UPCOMING };

          TasksClient.updateTask(update, noop);

          return expect(updateTaskCall.calledWithMatch({ status: 'needsAction' })).to.be.true;
        });

        it('sets "task.completed" to undefined', () => {
          const update = {
            id: 1,
            title: 'some update',
            taskStatus: constants.TASK_STATUS.UPCOMING,
            completed: 'not undefined',
          };

          TasksClient.updateTask(update, noop);

          return expect(updateTaskCall.calledWithMatch({ completed: undefined })).to.be.true;
        });

        it('sets "task.taskStatus" to undefined', () => {
          const update = {
            id: 1,
            title: 'some update',
            taskStatus: constants.TASK_STATUS.UPCOMING,
            completed: 'not undefined',
          };

          TasksClient.updateTask(update, noop);

          return expect(updateTaskCall.calledWithMatch({ taskStatus: undefined })).to.be.true;
        });
      });
    });

    describe('on successful update', () => {
      describe('calls updateResponseHandlerSpy', () => {
        it('once', () => {
          updateTaskCall.yields({});
          const updateResponseHandlerSpy = sinon.spy();
          TasksClient.updateTask({}, updateResponseHandlerSpy);

          return expect(updateResponseHandlerSpy.calledOnce).to.be.true;
        });

        describe('with task response mapped to correct properties', () => {
          it('containing original properties', () => {
            updateTaskCall.yields({ randomProperty: 'some rando property' });
            const updateResponseHandlerSpy = sinon.spy();
            TasksClient.updateTask({}, updateResponseHandlerSpy);

            return expect(updateResponseHandlerSpy.calledWithMatch({
              randomProperty: 'some rando property',
            })).to.be.true;
          });

          it('"task.taskStatus" = OVERDUE if status is "needsAction" and due date is past current time', () => {
            const beforeCurrentTime = '2017-12-18T09:00:00.000Z';
            updateTaskCall.yields({ status: 'needsAction', due: beforeCurrentTime });
            const updateResponseHandlerSpy = sinon.spy();
            TasksClient.updateTask({}, updateResponseHandlerSpy);

            return expect(updateResponseHandlerSpy.calledWithMatch({
              taskStatus: constants.TASK_STATUS.OVERDUE,
            })).to.be.true;
          });

          it('"task.taskStatus" = UPCOMING if status is "needsAction" and due date is after current time', () => {
            const afterCurrentTime = '2017-12-25T09:00:00.000Z';
            updateTaskCall.yields({ status: 'needsAction', due: afterCurrentTime });
            const updateResponseHandlerSpy = sinon.spy();
            TasksClient.updateTask({}, updateResponseHandlerSpy);

            return expect(updateResponseHandlerSpy.calledWithMatch({
              taskStatus: constants.TASK_STATUS.UPCOMING,
            })).to.be.true;
          });

          it('"task.taskStatus" = COMPLETED if "status" = "completed"', () => {
            updateTaskCall.yields({ status: 'completed' });
            const updateResponseHandlerSpy = sinon.spy();
            TasksClient.updateTask({}, updateResponseHandlerSpy);

            return expect(updateResponseHandlerSpy.calledWithMatch({
              taskStatus: constants.TASK_STATUS.COMPLETED,
            })).to.be.true;
          });
        });
      });
    });
  });

  describe('createTask()', () => {
    const createTaskCall = sinon.stub(GoogleTasksService, 'createTask');
    const createTask = {
      title: 'some task',
      due: '2017-12-19T00:00:00.000Z',
    };

    afterEach(() => {
      createTaskCall.reset();
    });

    describe('calls `GoogleTasksService.createTask()`', () => {
      it('once', () => {
        TasksClient.createTask(createTask, noop);

        return expect(createTaskCall.calledOnce).to.be.true;
      });

      describe('on successful create', () => {
        describe('calls createResponseHandlerSpy', () => {
          it('once', () => {
            createTaskCall.yields({});
            const createResponseHandlerSpy = sinon.spy();
            TasksClient.createTask(createTask, createResponseHandlerSpy);

            return expect(createResponseHandlerSpy.calledOnce).to.be.true;
          });
        });
      });
    });
  });
});
