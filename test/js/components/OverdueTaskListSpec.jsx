import { configure, shallow } from 'enzyme';
import chai from 'chai';
import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import configureStore from 'redux-mock-store';
import _ from 'lodash';

import OverdueTaskList from '../../../src/js/components/OverdueTaskList';
import OverdueTask from '../../../src/js/components/OverdueTask';

const { expect } = chai;

configure({ adapter: new Adapter() });
const mockStore = configureStore();
let store;
beforeEach(() => {
  store = mockStore({});
});

describe('<OverdueTaskList />', () => {
  it('should render no OverdueTask components if no tasks', () => {
    const taskListComponent = shallow(<OverdueTaskList store={store} />).dive();
    return expect(taskListComponent.find(OverdueTask)).to.have.length(0);
  });

  it('should render an OverdueTask component for every task in prop', () => {
    const tasks = [{ id: 1, title: 'blah1' }, { id: 2, title: 'blah2' }];
    store = mockStore(_.keyBy(tasks, 'id'));
    const taskListComponent = shallow(<OverdueTaskList store={store} />).dive();
    expect(taskListComponent.find(OverdueTask)).to.have.length(2);
  });

  it('creates OverdueTask component with key set to `task.id`', () => {
    const tasks = [{ id: 1, title: 'blah1' }];
    store = mockStore(_.keyBy(tasks, 'id'));
    const taskListComponent = shallow(<OverdueTaskList store={store} />).dive();
    expect(taskListComponent.find(OverdueTask).key()).to.equal('1');
  });
});

