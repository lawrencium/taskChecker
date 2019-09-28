import React from 'react';
import Pikaday from 'pikaday';
import moment from 'moment';

class TaskDateEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      due: this.props.due || moment(),
    };

    this.onDueDateChange = (due) => {
      this.setState({ due });
      this.props.onDueDateChange(due);
    };
  }

  componentDidMount() {
    const component = this;
    this.datepicker = new Pikaday({
      field: document.getElementById(component.props.fieldId),
      container: document.getElementById(component.props.containerId),
      defaultDate: component.state.due,
      setDefaultDate: true,
      onSelect: () => {
        component.onDueDateChange(moment(component.datepicker.getDate()));
      },
      format: 'MM/DD/Y',
    });
  }

  render() {
    return (
      <span className="datepicker-container">
        <input
          type="text"
          placeholder={this.state.due.format('MM/DD/Y')}
          id={this.props.fieldId}
          className="datepicker"
        />
        <span id={this.props.containerId} className="datepicker-popup" />
      </span>
    );
  }
}

export default TaskDateEditor;
