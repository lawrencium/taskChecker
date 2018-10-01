import React from 'react';
import { connect } from 'react-redux';
import { assign, isEqual } from 'lodash';
import classNames from 'classnames';
import moment from 'moment';

import actions from '../redux/actions';
import '../../styles/task.scss';
import constants from '../constants';
import TaskTextEditor from './TaskTextEditor';

class Task extends React.Component {
  constructor(props) {
    super(props);

    const { task } = props;

    this.state = {
      taskTitleText: task.title,
      taskNotesText: task.notes,
      taskStatus: task.taskStatus,
    };
  }

  onTaskTitleTextChange = (taskTitleText) => {
    this.setState({ taskTitleText });
  };

  onTaskNotesTextChange = (taskNotesText) => {
    this.setState({ taskNotesText });
  };

  onBlur = () => {
    this.submitTask();
  };

  toggleTaskChecked = () => {
    const statusAfterToggle = isTaskCompleted(this.state) ? constants.TASK_STATUS.OVERDUE : constants.TASK_STATUS.COMPLETED;
    this.setState({
      taskStatus: statusAfterToggle,
    }, () => this.submitTask());
  };


  submitTask = () => {
    const taskTitle = this.state.taskTitleText;
    const taskNotes = this.state.taskNotesText;
    const withUpdatedFields = {
      title: taskTitle,
      notes: taskNotes,
      taskStatus: this.state.taskStatus,
    };
    const updatedTask = assign({}, this.props.task, withUpdatedFields);
    this.props.asyncUpdateTask(updatedTask);
  };

  render() {
    const { task } = this.props;
    const isCompleted = isTaskCompleted(this.props.task);
    const isOverdue = isTaskOverdue(this.props.task);
    const taskStatus = {
      completed: isCompleted,
      overdue: isOverdue,
    };
    const dueDate = moment.utc(task.due).format('MM/DD/Y');

    return (
      <li className="task">
        <input type="checkbox" id={task.id} checked={isCompleted} onChange={this.toggleTaskChecked} />
        <label className={classNames(taskStatus)}>
          <TaskTextEditor
            taskTitleText={task.title}
            taskNotesText={task.notes}
            titlePlaceholder="Task"
            notesPlaceholder="Notes"
            onTaskTitleChange={this.onTaskTitleTextChange}
            onTaskNotesChange={this.onTaskNotesTextChange}
            onBlur={this.onBlur}
          />
        </label>
        <span className={classNames('due-date-box', taskStatus)}>
          <span className={classNames('due-date', taskStatus)}>
            {dueDate}
            &nbsp;&nbsp;
            {isOverdue && <i className="fa fa-exclamation-circle" />}
          </span>
        </span>
      </li>
    );
  }
}

const isTaskOverdue = (task) => {
  return isEqual(task.taskStatus, constants.TASK_STATUS.OVERDUE);
};

const isTaskCompleted = (task) => {
  return isEqual(task.taskStatus, constants.TASK_STATUS.COMPLETED);
};

const mapDispatchToProps = (dispatch) => {
  return {
    asyncUpdateTask: (task) => {
      dispatch(actions.asyncUpdateTask(task));
    },
  };
};

export default connect(null, mapDispatchToProps)(Task);
