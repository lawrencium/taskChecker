import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import classNames from 'classnames';
import moment from 'moment';

import actions from '../redux/actions';
import '../../styles/overdueTask.scss';

function isTaskCompleted(task) {
  return _.isEqual(task.status, 'completed');
}

class OverdueTask extends React.Component {
  toggleTaskChecked = () => {
    const statusAfterToggle = isTaskCompleted(this.props.task) ? 'needsAction' : 'completed';

    const upsertTask = _.assign({}, this.props.task, { status: statusAfterToggle, completed: undefined });
    this.props.asyncUpsertTask(upsertTask);
  };

  render() {
    const { task } = this.props;
    const isCompleted = isTaskCompleted(this.props.task);
    const classIfTaskCompleted = {
      completed: isCompleted,
    };
    const dueDate = moment.utc(task.due).format('M/D/Y');

    return (
      <li className="overdue-task">
        <input type="checkbox" id={task.id} checked={isCompleted} onChange={this.toggleTaskChecked} />
        <label htmlFor={task.id} className={classNames(classIfTaskCompleted)}>{task.title}</label>
        <div className={classNames('due-date-box', classIfTaskCompleted)}>
          <div className="caption">due</div>
          <div className={classNames('due-date', classIfTaskCompleted)}> {dueDate}</div>
        </div>
      </li>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    asyncUpsertTask: (task) => {
      dispatch(actions.asyncUpsertOverdueTask(task));
    },
  };
};

export default connect(null, mapDispatchToProps)(OverdueTask);
