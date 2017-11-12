import chai from 'chai';
import React from 'react';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import moment from 'moment';
import configureStore from 'redux-mock-store';

import AddTask from '../../../src/js/components/AddTask';
import actions from '../../../src/js/redux/actions';

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

describe('<AddTask />', () => {
  it('renders input field for datepicker', () => {
    expect(addTaskWrapper.find('#add-task-datepicker')).to.have.lengthOf(1);
  });

  it('renders input field for task title', () => {
    expect(addTaskWrapper.find('#add-task-title')).to.have.lengthOf(1);
  });

  it('renders a submit button', () => {
    expect(addTaskWrapper.find('button')).to.have.lengthOf(1);
  });

  describe('task title input', () => {
    it('`taskTitle` defaults to empty string', () => {
      return expect(addTaskWrapper.state('taskTitle')).to.be.empty;
    });

    it('`taskTitle` is bound to text in #add-task-title', () => {
      const taskTitle = 'this is the task title';
      addTaskWrapper.find('#add-task-title').simulate('change', { target: { value: taskTitle } });

      return expect(addTaskWrapper.state('taskTitle')).to.equal(taskTitle);
    });
  });

  describe('datepicker', () => {
    it('`due` defaults to undefined date', () => {
      return expect(addTaskWrapper.state('selectedDate')).to.be.undefined;
    });

    it('`due` is updated when `updateSelectedDate` is called', () => {
      addTaskWrapper.instance().updateSelectedDate('2017-12-19');

      const expected = moment('2017-12-19');
      expect(addTaskWrapper.state('due')).to.eql(expected);
    });
  });

  describe('submit button onClick', () => {
    it('dispatches single `ASYNC_CREATE_TASK` action', () => {
      addTaskWrapper.find('button').simulate('click');
      const expectedAction = actions.asyncCreateTask({ title: '', due: undefined });

      return expect(store.getActions()).to.eql([expectedAction]);
    });

    it('dispatches action with updated due date and task title', () => {
      const dueDate = '2017-12-19';
      const taskTitle = 'some task title';
      addTaskWrapper.instance().updateSelectedDate(dueDate);
      addTaskWrapper.find('#add-task-title').simulate('change', { target: { value: taskTitle } });

      addTaskWrapper.find('button').simulate('click');

      const expectedAction = actions.asyncCreateTask({
        title: taskTitle,
        due: moment(dueDate),
      });

      return expect(store.getActions()).to.eql([expectedAction]);
    });

    it('after submit, clears task title field', () => {
      const taskTitle = 'some task title';
      addTaskWrapper.find('#add-task-title').simulate('change', { target: { value: taskTitle } });

      addTaskWrapper.find('button').simulate('click');

      return expect(addTaskWrapper.state('taskTitle')).to.be.empty;
    });

    it('after submit, clears datepicker field', () => {
      const dueDate = '2017-12-19';
      addTaskWrapper.instance().updateSelectedDate(dueDate);

      addTaskWrapper.find('button').simulate('click');

      return expect(addTaskWrapper.state('due')).to.be.null;
    });
  });
});
