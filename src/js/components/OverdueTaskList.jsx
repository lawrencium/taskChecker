import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import OverdueTask from './OverdueTask';

class OverdueTaskList extends React.Component {
  createOverdueTasks() {
    return _.map(this.props.overdueTasks, (task) => {
      return (
        <OverdueTask task={task} key={task.id} />
      );
    });
  }

  render() {
    return (
      <ul>
        {this.createOverdueTasks()}
      </ul>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    overdueTasks: _.values(state),
  };
};


export default connect(mapStateToProps)(OverdueTaskList);
