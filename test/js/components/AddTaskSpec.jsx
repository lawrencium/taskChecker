import chai from 'chai';
import React from 'react';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import moment from 'moment';
import configureStore from 'redux-mock-store';
import sinon from 'sinon';

import AddTask from '../../../src/js/components/AddTask';
import actions from '../../../src/js/redux/actions';
import constants from '../../../src/js/constants';
import TaskTextEditor from '../../../src/js/components/TaskTextEditor';

const { expect } = chai;
configure({ adapter: new Adapter() });

const mockStore = configureStore();
let store;
beforeEach(() => {
  store = mockStore({});
});

let addTaskWrapper;
beforeEach(() => {
  addTaskWrapper = shallow(<AddTask store={store} />).dive();
});

const currentFakeTime = '2017-12-19T09:00:00.000Z';
const clock = sinon.useFakeTimers(moment(currentFakeTime).valueOf());
after(() => {
  clock.restore();
});

describe('<AddTask />', () => {
  it('renders input field for datepicker', () => {
    expect(addTaskWrapper.find('#add-task-datepicker')).to.have.lengthOf(1);
  });

  it('renders a submit button', () => {
    expect(addTaskWrapper.find('button')).to.have.lengthOf(1);
  });

  describe('datepicker', () => {
    it('`due` defaults to today', () => {
      return expect(addTaskWrapper.state('due').isSame(currentFakeTime)).to.be.true;
    });

    it('`due` is updated when `updateSelectedDate` is called', () => {
      addTaskWrapper.instance().updateSelectedDate('2017-12-19');

      const expected = moment('2017-12-19');
      expect(addTaskWrapper.state('due')).to.eql(expected);
    });
  });

  describe('submit button', () => {
    it('has `overdue` class if there are overdue tasks', () => {
      store = mockStore({ 1: { taskStatus: constants.TASK_STATUS.OVERDUE } });
      const withOverdueTasks = shallow(<AddTask store={store} />).dive();

      return expect(withOverdueTasks.find('button.overdue')).to.have.lengthOf(1);
    });

    it('has no `overdue` class if no overdue tasks', () => {
      return expect(addTaskWrapper.find('button.overdue')).to.have.lengthOf(0);
    });
  });

  describe('submit button onClick', () => {
    it('dispatches single `ASYNC_CREATE_TASK` action', () => {
      addTaskWrapper.find('button').simulate('click');
      const expectedAction = actions.asyncCreateTask({ title: '', due: currentFakeTime, notes: '' });

      return expect(store.getActions()[0]).to.eql(expectedAction);
    });

    it('dispatches action with updated due date, task title, and task notes', () => {
      const dueDate = '2017-12-20';
      const taskTitle = 'some task title';
      const taskNotes = 'some task notes';
      addTaskWrapper.instance().updateSelectedDate(dueDate);

      addTaskWrapper.find(TaskTextEditor).props().onTaskTitleChange(taskTitle);
      addTaskWrapper.find(TaskTextEditor).props().onTaskNotesChange(taskNotes);

      addTaskWrapper.find('button').simulate('click');

      const expectedAction = actions.asyncCreateTask({
        title: taskTitle,
        due: moment(dueDate).toISOString(),
        notes: taskNotes,
      });

      return expect(store.getActions()).to.eql([expectedAction]);
    });

    it('after submit, clears task title field', () => {
      const taskTitle = 'some task title';

      addTaskWrapper.find(TaskTextEditor).props().onTaskTitleChange(taskTitle);

      addTaskWrapper.find('button').simulate('click');
      return expect(addTaskWrapper.state('taskTitleText')).to.be.empty;
    });

    it('after submit, clears task notes field', () => {
      const taskNotes = 'some task notes';
      addTaskWrapper.find(TaskTextEditor).props().onTaskNotesChange(taskNotes);

      addTaskWrapper.find('button').simulate('click');
      return expect(addTaskWrapper.state('taskNotesText')).to.be.empty;
    });

    it('after submit, datepicker stays the same', () => {
      const dueDate = '2017-12-20';
      addTaskWrapper.instance().updateSelectedDate(dueDate);

      addTaskWrapper.find('button').simulate('click');

      return expect(addTaskWrapper.state('due').isSame(moment(dueDate))).to.be.true;
    });
  });
});
