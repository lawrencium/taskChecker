import chai from 'chai';
import React from 'react';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import moment from 'moment';
import configureStore from 'redux-mock-store';
import { ContentState, Editor, EditorState } from 'draft-js';

import AddTask from '../../../src/js/components/AddTask';
import actions from '../../../src/js/redux/actions';
import constants from '../../../src/js/constants';

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

  it('renders Editor field for task title', () => {
    expect(addTaskWrapper.find('.add-task-title-container').find(Editor)).to.have.lengthOf(1);
  });

  it('renders Editor field for task notes', () => {
    expect(addTaskWrapper.find('.add-task-notes-container').find(Editor)).to.have.lengthOf(1);
  });

  it('renders a submit button', () => {
    expect(addTaskWrapper.find('button')).to.have.lengthOf(1);
  });

  describe('task title input', () => {
    it('`taskTitleEditorState` defaults to empty string', () => {
      return expect(addTaskWrapper.state('taskTitleEditorState').getCurrentContent().getPlainText()).to.be.empty;
    });

    it('`taskTitleEditorState` is bound to text in Editor', () => {
      const taskTitle = 'this is the task title';
      addTaskWrapper.find('.add-task-title-container').find(Editor).simulate('change', taskTitle);

      return expect(addTaskWrapper.state('taskTitleEditorState')).to.equal(taskTitle);
    });
  });

  describe('task notes input', () => {
    it('`taskNotesEditorState` defaults to empty', () => {
      return expect(addTaskWrapper.state('taskNotesEditorState').getCurrentContent().getPlainText()).to.be.empty;
    });

    it('`taskNotesEditorState` is bound to text in Editor', () => {
      const taskNotes = 'this is the task notes';
      addTaskWrapper.find('.add-task-notes-container').find(Editor).simulate('change', taskNotes);

      return expect(addTaskWrapper.state('taskNotesEditorState')).to.equal(taskNotes);
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
      const expectedAction = actions.asyncCreateTask({ title: '', due: undefined, notes: '' });

      return expect(store.getActions()).to.eql([expectedAction]);
    });

    it('dispatches action with updated due date, task title, and task notes', () => {
      const dueDate = '2017-12-19';
      const taskTitle = 'some task title';
      const taskNotes = 'some task notes';
      addTaskWrapper.instance().updateSelectedDate(dueDate);

      const updatedTaskTitleState = EditorState.createWithContent(ContentState.createFromText(taskTitle));
      const updatedTaskNotesState = EditorState.createWithContent(ContentState.createFromText(taskNotes));

      addTaskWrapper.find('.add-task-title-container').find(Editor).simulate('change', updatedTaskTitleState);
      addTaskWrapper.find('.add-task-notes-container').find(Editor).simulate('change', updatedTaskNotesState);

      addTaskWrapper.find('button').simulate('click');

      const expectedAction = actions.asyncCreateTask({
        title: taskTitle,
        due: moment(dueDate),
        notes: taskNotes,
      });

      return expect(store.getActions()).to.eql([expectedAction]);
    });

    it('after submit, clears task title field', () => {
      const taskTitle = 'some task title';
      const updatedTaskTitleState = EditorState.createWithContent(ContentState.createFromText(taskTitle));

      addTaskWrapper.find('.add-task-title-container').find(Editor).simulate('change', updatedTaskTitleState);

      addTaskWrapper.find('button').simulate('click');
      return expect(addTaskWrapper.state('taskTitleEditorState').getCurrentContent().getPlainText()).to.be.empty;
    });

    it('after submit, clears task notes field', () => {
      const taskNotes = 'some task notes';
      const updatedTaskTitleState = EditorState.createWithContent(ContentState.createFromText(taskNotes));

      addTaskWrapper.find('.add-task-notes-container').find(Editor).simulate('change', updatedTaskTitleState);

      addTaskWrapper.find('button').simulate('click');
      return expect(addTaskWrapper.state('taskNotesEditorState').getCurrentContent().getPlainText()).to.be.empty;
    });

    it('after submit, clears datepicker field', () => {
      const dueDate = '2017-12-19';
      addTaskWrapper.instance().updateSelectedDate(dueDate);

      addTaskWrapper.find('button').simulate('click');

      return expect(addTaskWrapper.state('due')).to.be.null;
    });
  });
});
