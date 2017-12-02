import React from 'react';
import { connect } from 'react-redux';
import { assign, isEqual } from 'lodash';
import classNames from 'classnames';
import moment from 'moment';

import actions from '../redux/actions';
import '../../styles/task.scss';
import constants from '../constants';

class Task extends React.Component {
  toggleTaskChecked = () => {
    const statusAfterToggle = isTaskCompleted(this.props.task) ? constants.TASK_STATUS.OVERDUE : constants.TASK_STATUS.COMPLETED;

    const updatedTask = assign({}, this.props.task, { taskStatus: statusAfterToggle });
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
        <div className="task-title">
          <input type="checkbox" id={task.id} checked={isCompleted} onChange={this.toggleTaskChecked} />
          <label htmlFor={task.id} className={classNames(taskStatus)}>{task.title}</label>
          <div className={classNames('due-date-box', taskStatus)}>
            <div className={classNames('due-date', taskStatus)}>
              {dueDate}
            &nbsp;&nbsp;
              {isOverdue && <i className="fa fa-exclamation-circle" />}
            </div>
          </div>
        </div>
        <div className="task-notes">
          {task.notes}
        </div>
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
