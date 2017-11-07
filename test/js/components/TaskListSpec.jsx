import { configure, shallow } from 'enzyme';
import chai from 'chai';
import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import configureStore from 'redux-mock-store';
import { keyBy } from 'lodash';

import TaskList from '../../../src/js/components/TaskList';
import Task from '../../../src/js/components/Task';
import constants from '../../../src/js/constants';

const { expect } = chai;

configure({ adapter: new Adapter() });
const mockStore = configureStore();
let store;
beforeEach(() => {
  store = mockStore({});
});

describe('<TaskList />', () => {
  it('should render no Task components if no tasks', () => {
    const taskListComponent = shallow(<TaskList store={store} />).dive();
    return expect(taskListComponent.find(Task)).to.have.length(0);
  });

  it('should render an Task component for every task with `taskStatus` = constants.TASK_STATUS.OVERDUE in prop', () => {
    const tasks = [{ id: 1, title: 'blah1', taskStatus: constants.TASK_STATUS.OVERDUE }, {
      id: 2,
      title: 'blah2',
      taskStatus: constants.TASK_STATUS.OVERDUE,
    }];
    store = mockStore(keyBy(tasks, 'id'));
    const taskListComponent = shallow(<TaskList store={store} />).dive();
    expect(taskListComponent.find(Task)).to.have.length(2);
  });

  it('renders Task components in order of most overdue to least overdue (sorted by due date)', () => {
    const tasks = [
      {
        id: 1,
        title: 'blah1',
        taskStatus: constants.TASK_STATUS.OVERDUE,
        due: '2017-12-19T09:00:00.000Z',
      },
      {
        id: 2,
        title: 'blah2',
        taskStatus: constants.TASK_STATUS.OVERDUE,
        due: '2017-12-18T09:00:00.000Z',
      }];
    store = mockStore(keyBy(tasks, 'id'));
    const taskListComponent = shallow(<TaskList store={store} />).dive();
    expect(taskListComponent.find(Task).first().key()).to.equal('2');
  });

  it('creates Task component with key set to `task.id`', () => {
    const tasks = [{ id: 1, title: 'blah1', taskStatus: constants.TASK_STATUS.OVERDUE }];
    store = mockStore(keyBy(tasks, 'id'));
    const taskListComponent = shallow(<TaskList store={store} />).dive();
    expect(taskListComponent.find(Task).key()).to.equal('1');
  });
});

