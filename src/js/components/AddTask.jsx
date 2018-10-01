import React from 'react';
import moment from 'moment';
import Pikaday from 'pikaday';
import { connect } from 'react-redux';
import { uniqueId, values } from 'lodash';
import classNames from 'classnames';

import '../../styles/addTask.scss';
import actions from '../redux/actions';
import constants from '../constants';
import TaskTextEditor from './TaskTextEditor';

class AddTask extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      due: moment(),
      addTaskKey: uniqueId(),
      taskTitleText: '',
      taskNotesText: '',
    };

    this.onTaskTitleTextChange = (taskTitleText) => {
      this.setState({ taskTitleText });
    };
    this.onTaskNotesTextChange = (taskNotesText) => {
      this.setState({ taskNotesText });
    };
  }

  componentDidMount() {
    const component = this;
    this.datepicker = new Pikaday({
      field: document.getElementById('add-task-datepicker'),
      container: document.getElementById('add-task-calendar-container'),
      defaultDate: component.state.due,
      setDefaultDate: true,
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
    const taskTitle = this.state.taskTitleText;
    const taskNotes = this.state.taskNotesText;
    const taskToCreate = {
      title: taskTitle,
      due: this.state.due.utcOffset(0, true).toISOString(),
      notes: taskNotes,
    };
    this.props.asyncCreateTask(taskToCreate);
    this.setState({
      addTaskKey: uniqueId(),
      taskTitleText: '',
      taskNotesText: '',
    });
    this.datepicker.setDate(null);
  };

  render() {
    return (
      <div className="add-task">
        <span className="add-task-buttons-container">
          <div className="datepicker-container">
            <input
              type="text"
              placeholder={this.state.due.format('MM/DD/Y')}
              id="add-task-datepicker"
              className="datepicker"
            />
            <div id="add-task-calendar-container" />
          </div>
          <div className="submit-button-container">
            <button
              onClick={this.submitTask}
              className={classNames('fa fa-plus', { overdue: this.props.hasOverdueTasks })}
            />
          </div>
        </span>
        <TaskTextEditor
          key={this.state.addTaskKey}
          titlePlaceholder="Unclutter your mind"
          notesPlaceholder="Notes"
          taskTitleText={this.state.taskTitleText}
          onTaskTitleChange={this.onTaskTitleTextChange}
          taskNotesText={this.state.taskNotesText}
          onTaskNotesChange={this.onTaskNotesTextChange}
        />
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
