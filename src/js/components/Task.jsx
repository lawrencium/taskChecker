import React from 'react';
import { connect } from 'react-redux';
import { assign, isEqual } from 'lodash';
import classNames from 'classnames';
import moment from 'moment';

import actions from '../redux/actions';
import '../../styles/task.scss';
import constants from '../constants';
import TaskTextEditor from './TaskTextEditor';
import TaskDateEditor from './TaskDateEditor';

class Task extends React.Component {
  constructor(props) {
    super(props);

    const { task } = props;

    this.state = {
      taskTitleText: task.title,
      taskNotesText: task.notes,
      taskStatus: task.taskStatus,
      taskDueDate: moment.utc(task.due),
    };
  }

  onTaskTitleTextChange = (taskTitleText) => {
    this.setState({ taskTitleText });
  };

  onTaskNotesTextChange = (taskNotesText) => {
    this.setState({ taskNotesText });
  };

  onTaskDueDateChange = (taskDueDate) => {
    this.setState({ taskDueDate });
    this.submitTask();
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
      due: this.state.taskDueDate.utcOffset(0, true).toISOString(),
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
          <TaskDateEditor
            fieldId={`due-date-field-${task.id}`}
            containerId={`due-date-container-${task.id}`}
            due={this.state.taskDueDate}
            onDueDateChange={this.onTaskDueDateChange}
          />
          &nbsp;&nbsp;
          {isOverdue && <i className={classNames('overdue-icon', 'fa', 'fa-exclamation-circle')} />}
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
