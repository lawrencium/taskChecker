import chai from 'chai';
import React from 'react';
import { configure, shallow } from 'enzyme';
import sinon from 'sinon';
import { ContentState, Editor, EditorState } from 'draft-js';
import Adapter from 'enzyme-adapter-react-16';
import TaskTextEditor from '../../../src/js/components/TaskTextEditor';

const { expect } = chai;
configure({ adapter: new Adapter() });

const placeholderText = 'placeholderTextytext';
const taskTitleText = 'task title';
const taskNotesText = 'task notes';
let onTaskTitleChangeCallback;
let onTaskNotesChangeCallback;
let onBlurCallback;
let taskTextEditorWrapper;
beforeEach(() => {
  onTaskTitleChangeCallback = sinon.spy();
  onTaskNotesChangeCallback = sinon.spy();
  onBlurCallback = sinon.spy();
  taskTextEditorWrapper = shallow(<TaskTextEditor
    placeholder={placeholderText}
    onTaskTitleChange={onTaskTitleChangeCallback}
    taskTitleText={taskTitleText}
    taskNotesText={taskNotesText}
    onTaskNotesChange={onTaskNotesChangeCallback}
    onBlur={onBlurCallback}
  />);
});


describe('<TaskTextEditor />', () => {
  describe('task title', () => {
    it('renders an <Editor />', () => {
      const editors = taskTextEditorWrapper.find('.task-title-container').find(Editor);
      expect(editors).to.have.length(1);
    });

    describe('input', () => {
      it('`taskTitleEditorState` defaults to `taskTitleText` prop', () => {
        return expect(taskTextEditorWrapper.state('taskTitleEditorState').getCurrentContent().getPlainText()).to.equal(taskTitleText);
      });

      it('`taskTitleEditorState` is bound to text in Editor', () => {
        const taskTitle = 'this is the task title';
        const updatedEditorState = EditorState.createWithContent(ContentState.createFromText(taskTitle));
        taskTextEditorWrapper.find('.task-title-container').find(Editor).simulate('change', updatedEditorState);

        return expect(taskTextEditorWrapper.state('taskTitleEditorState')).to.equal(updatedEditorState);
      });

      it('calls `onTaskTitleChange` callback', () => {
        const taskTitle = 'this is the task title';
        const updatedEditorState = EditorState.createWithContent(ContentState.createFromText(taskTitle));
        taskTextEditorWrapper.find('.task-title-container').find(Editor).simulate('change', updatedEditorState);

        return expect(onTaskTitleChangeCallback.calledWith(taskTitle)).to.be.true;
      });
    });
  });
  describe('task notes', () => {
    it('renders an <Editor />', () => {
      const editors = taskTextEditorWrapper.find('.task-notes-container').find(Editor);
      expect(editors).to.have.length(1);
    });

    describe('input', () => {
      it('`taskNotesEditorState` defaults to `taskNotesText` prop', () => {
        return expect(taskTextEditorWrapper.state('taskNotesEditorState').getCurrentContent().getPlainText()).to.equal(taskNotesText);
      });

      it('`taskNotesEditorState` is bound to text in Editor', () => {
        const taskNotes = 'this is the task notes';
        const updatedEditorState = EditorState.createWithContent(ContentState.createFromText(taskNotes));
        taskTextEditorWrapper.find('.task-notes-container').find(Editor).simulate('change', updatedEditorState);

        return expect(taskTextEditorWrapper.state('taskNotesEditorState')).to.equal(updatedEditorState);
      });

      it('calls `onTaskNotesChange` callback', () => {
        const taskNotes = 'this is the task notes';
        const updatedEditorState = EditorState.createWithContent(ContentState.createFromText(taskNotes));
        taskTextEditorWrapper.find('.task-notes-container').find(Editor).simulate('change', updatedEditorState);

        return expect(onTaskNotesChangeCallback.calledWith(taskNotes)).to.be.true;
      });
    });
  });

  describe('onBlur', () => {
    it('calls `onBlurCallback` on task title blur', () => {
      const editor = taskTextEditorWrapper.find('.task-title-container').find(Editor);
      editor.simulate('focus');
      editor.simulate('blur');

      return expect(onBlurCallback.calledOnce).to.be.true;
    });
    it('calls `onBlurCallback` on task notes blur', () => {
      const editor = taskTextEditorWrapper.find('.task-notes-container').find(Editor);
      editor.simulate('focus');
      editor.simulate('blur');

      return expect(onBlurCallback.calledOnce).to.be.true;
    });
  });
});
