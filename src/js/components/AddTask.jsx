import React from 'react';
import moment from 'moment';
import Pikaday from 'pikaday';
import { connect } from 'react-redux';
import { values } from 'lodash';
import classNames from 'classnames';
import { ContentState, Editor, EditorState } from 'draft-js';

import '../../styles/addTask.scss';
import actions from '../redux/actions';
import constants from '../constants';

class AddTask extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      due: undefined,
      taskTitleEditorState: EditorState.createEmpty(),
      taskNotesEditorState: EditorState.createEmpty(),
    };

    this.onTaskTitleChange = (taskTitleEditorState) => {
      this.setState({ taskTitleEditorState });
    };

    this.onTaskNotesChange = (taskNotesEditorState) => {
      this.setState({ taskNotesEditorState });
    };
  }

  componentDidMount() {
    const component = this;
    this.datepicker = new Pikaday({
      field: document.getElementById('add-task-datepicker'),
      container: document.getElementById('add-task-calendar-container'),
      onSelect: () => {
        component.updateSelectedDate(moment(component.datepicker.getDate()));
      },
      format: 'MM/DD/Y',
    });
  }

  updateSelectedDate(date) {
    this.setState({ due: moment(date) });
  }

  submitTask = () => {
    const taskTitle = this.state.taskTitleEditorState.getCurrentContent().getPlainText();
    const taskNotes = this.state.taskNotesEditorState.getCurrentContent().getPlainText();

    const taskToCreate = {
      title: taskTitle,
      due: this.state.due,
      notes: taskNotes,
    };
    this.props.asyncCreateTask(taskToCreate);
    const withClearedTitleState = EditorState.push(this.state.taskTitleEditorState, ContentState.createFromText(''));
    const withClearedNotesState = EditorState.push(this.state.taskNotesEditorState, ContentState.createFromText(''));
    this.setState({
      due: null,
      taskTitleEditorState: withClearedTitleState,
      taskNotesEditorState: withClearedNotesState,
    });
    this.datepicker.setDate(null);
  };

  render() {
    return (
      <div className="add-task">
        <div className="add-task-title-container">
          <Editor
            editorState={this.state.taskTitleEditorState}
            onChange={this.onTaskTitleChange}
            placeholder="Declutter your mind"
          />
        </div>
        <span className="add-task-buttons-container">
          <span className="datepicker-container">
            <input type="text" placeholder="mm/dd/yyyy" id="add-task-datepicker" />
            <div id="add-task-calendar-container" />
          </span>
          <span className="submit-button-container">
            <button
              onClick={this.submitTask}
              className={classNames('fa fa-plus', { overdue: this.props.hasOverdueTasks })}
            />
          </span>
        </span>
        <div className="add-task-notes-container">
          <Editor
            editorState={this.state.taskNotesEditorState}
            onChange={this.onTaskNotesChange}
            placeholder="Notes"
          />
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    asyncCreateTask: (task) => {
      dispatch(actions.asyncCreateTask(task));
    },
  };
};

const mapStateToProps = (state) => {
  const tasks = values(state);
  const hasOverdueTasks = tasks.some(task => task.taskStatus === constants.TASK_STATUS.OVERDUE);
  return {
    hasOverdueTasks,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AddTask);
