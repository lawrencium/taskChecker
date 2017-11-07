import React from 'react';
import { connect } from 'react-redux';
import { filter, isEmpty, sortBy, values } from 'lodash';
import moment from 'moment';

import Task from './Task';
import constants from '../constants';
import '../../styles/taskList.scss';

class TaskList extends React.Component {
  createOverdueTasks() {
    return this.props.overdueTasks.map((task) => {
      return (
        <Task task={task} key={task.id} />
      );
    });
  }

  createUpcomingTasks() {
    return this.props.upcomingTasks.map((task) => {
      return (
        <Task task={task} key={task.id} />
      );
    });
  }

  createCompletedTasks() {
    return this.props.completedTasks.map((task) => {
      return (
        <Task task={task} key={task.id} />
      );
    });
  }

  render() {
    return (
      <div>
        <ul>
          {!isEmpty(this.props.overdueTasks) &&
          <div className="list-title">Overdue Tasks</div>}

          {this.createOverdueTasks()}
        </ul>

        <ul>
          {!isEmpty(this.props.upcomingTasks) &&
            <div className="list-title">Upcoming Tasks</div>}

          {this.createUpcomingTasks()}
        </ul>

        <ul>
          {!isEmpty(this.props.completedTasks) && <div className="list-title">Completed Tasks</div>}

          {this.createCompletedTasks()}
        </ul>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  const tasks = values(state);
  const overdueTasks = filter(tasks, task => task.taskStatus === constants.TASK_STATUS.OVERDUE);
  const overdueTasksSortedByDueDate = sortBy(overdueTasks, task => moment(task.due));

  const upcomingTasks = filter(tasks, task => task.taskStatus === constants.TASK_STATUS.UPCOMING);
  const upcomingTasksSortedByDueDate = sortBy(upcomingTasks, task => moment(task.due));

  const completedTasks = filter(tasks, task => task.taskStatus === constants.TASK_STATUS.COMPLETED);
  const completedTasksSortedByDueDate = sortBy(completedTasks, task => moment(task.due));

  return {
    overdueTasks: overdueTasksSortedByDueDate,
    upcomingTasks: upcomingTasksSortedByDueDate,
    completedTasks: completedTasksSortedByDueDate,
  };
};


export default connect(mapStateToProps)(TaskList);
