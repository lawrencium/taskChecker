import React from 'react';
import moment from 'moment';
import Pikaday from 'pikaday';
import { connect } from 'react-redux';

import '../../styles/addTask.scss';
import actions from '../redux/actions';

class AddTask extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      due: undefined,
      taskTitle: '',
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
    const taskToCreate = {
      title: this.state.taskTitle,
      due: this.state.due,
    };
    this.props.asyncCreateTask(taskToCreate);
    this.setState({
      taskTitle: '',
      due: null,
    });
    this.datepicker.setDate(null);
  };

  taskTitleChange = (e) => {
    this.setState({
      taskTitle: e.target.value,
    });
  };

  render() {
    return (
      <div className="add-task">
        <span className="add-task-title-container">
          <textarea type="text" id="add-task-title" value={this.state.taskTitle} onChange={this.taskTitleChange} placeholder="What's on your mind?" />
        </span>
        <span className="add-task-buttons-container">
          <span className="datepicker-container">
            <input type="text" placeholder="mm/dd/yyyy" id="add-task-datepicker" />
            <div id="add-task-calendar-container" />
          </span>
          <span className="submit-button-container">
            <button onClick={this.submitTask} className="fa fa-plus" />
          </span>
        </span>
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

export default connect(null, mapDispatchToProps)(AddTask);
