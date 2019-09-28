import chai from 'chai';
import React from 'react';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import sinon from 'sinon';
import moment from 'moment';

import configureStore from 'redux-mock-store';
import TaskDateEditor from '../../../src/js/components/TaskDateEditor';

const mockStore = configureStore();
let store;
beforeEach(() => {
  store = mockStore({});
});

let dateEditor;
let onDueDateChangeCallback;
const fieldId = 'fieldId';
const containerId = 'containerId';
beforeEach(() => {
  onDueDateChangeCallback = sinon.spy();
  dateEditor = shallow(<TaskDateEditor
    store={store}
    fieldId={fieldId}
    containerId={containerId}
    onDueDateChange={onDueDateChangeCallback}
  />);
});

const currentFakeTime = '2017-12-19T09:00:00.000Z';
const clock = sinon.useFakeTimers(moment(currentFakeTime).valueOf());
after(() => {
  clock.restore();
});


const { expect } = chai;
configure({ adapter: new Adapter() });

describe('<TaskDateEditor />', () => {
  it('renders input field from prop', () => {
    expect(dateEditor.find(`#${fieldId}`)).to.have.lengthOf(1);
  });

  it('renders container field from prop', () => {
    expect(dateEditor.find(`#${containerId}`)).to.have.lengthOf(1);
  });

  it('sets due date from prop', () => {
    const dueDate = moment('2019-09-09');
    const dateEditorWithDueDate = shallow(<TaskDateEditor
      store={store}
      fieldId={fieldId}
      containerId={containerId}
      due={dueDate}
      onDueDateChange={onDueDateChangeCallback}
    />);
    return expect(dateEditorWithDueDate.state('due').isSame(dueDate)).to.be.true;
  });

  it('due date defaults to today', () => {
    return expect(dateEditor.state('due').isSame(currentFakeTime)).to.be.true;
  });
});
