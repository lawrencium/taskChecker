import { configure, shallow } from 'enzyme';
import chai from 'chai';
import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import configureStore from 'redux-mock-store';
import { assign } from 'lodash';

import Task from '../../../src/js/components/Task';
import actions from '../../../src/js/redux/actions';
import constants from '../../../src/js/constants';

const { expect } = chai;

configure({ adapter: new Adapter() });

const mockStore = configureStore();
let store;
beforeEach(() => {
  store = mockStore({});
});

describe('<Task />', () => {
  let taskComponent;
  const task = {
    id: '1',
    title: 'taskTitle',
    taskStatus: constants.TASK_STATUS.COMPLETED,
    due: '2017-10-01T00:00:00.000Z',
    notes: 'task notes go here',
  };
  beforeEach(() => {
    taskComponent = shallow(<Task task={task} store={store} />).dive();
  });

  it('creates wrapping li on render()', () => {
    return expect(taskComponent.first().is('li')).to.be.true;
  });

  it('displays task title', () => {
    return expect(taskComponent.text()).to.contain(task.title);
  });

  it('displays task notes', () => {
    return expect(taskComponent.text()).to.contain(task.notes);
  });

  it('has no elements with class `completed` if task.taskStatus is not `COMPLETED`', () => {
    const incompleteTask = {
      id: '1', title: 'taskTitle', taskStatus: constants.TASK_STATUS.OVERDUE, due: '2017-10-29T00:00:00.000Z',
    };
    const incompleteTaskComponent = shallow(<Task task={incompleteTask} store={store} />).dive();

    expect(incompleteTaskComponent.find('.completed')).to.have.lengthOf(0);
  });

  it('has elements with class `completed` if task.taskStatus is `COMPLETED`', () => {
    expect(taskComponent.find('.completed').length).to.be.above(0);
  });

  it('has class `overdue` if task.taskStatus is `OVERDUE`', () => {
    const overdueTask = {
      id: '1', title: 'taskTitle', taskStatus: constants.TASK_STATUS.OVERDUE, due: '2017-10-29T00:00:00.000Z',
    };
    const overdueTaskComponent = shallow(<Task task={overdueTask} store={store} />).dive();

    expect(overdueTaskComponent.find('.overdue').length).to.be.above(0);
  });

  it('does not have class `overdue` if task.taskStatus is not `OVERDUE`', () => {
    const notOverdueTask = {
      id: '1', title: 'taskTitle', taskStatus: constants.TASK_STATUS.UPCOMING, due: '2017-10-29T00:00:00.000Z',
    };
    const notOverdueTaskComponent = shallow(<Task task={notOverdueTask} store={store} />).dive();

    expect(notOverdueTaskComponent.find('.overdue')).to.have.lengthOf(0);
  });

  it('displays font-awesome `fa-exclamation-circle` for overdue task', () => {
    const overdueTask = {
      id: '1', title: 'taskTitle', taskStatus: constants.TASK_STATUS.OVERDUE, due: '2017-10-29T00:00:00.000Z',
    };
    const overdueTaskComponent = shallow(<Task task={overdueTask} store={store} />).dive();

    expect(overdueTaskComponent.find('.fa-exclamation-circle')).to.have.lengthOf(1);
  });

  it('does not display font-awesome `fa-exclamation-circle` for non-overdue task', () => {
    const notOverdueTask = {
      id: '1', title: 'taskTitle', taskStatus: constants.TASK_STATUS.UPCOMING, due: '2017-10-29T00:00:00.000Z',
    };
    const notOverdueTaskComponent = shallow(<Task task={notOverdueTask} store={store} />).dive();

    expect(notOverdueTaskComponent.find('.fa-exclamation-circle')).to.have.lengthOf(0);
  });

  describe('li', () => {
    let li;
    beforeEach(() => {
      li = taskComponent.find('li').first();
    });

    it('has label', () => {
      return expect(li.find('label')).to.have.length(1);
    });

    it('has input', () => {
      return expect(li.find('input')).to.have.length(1);
    });

    it('has .due-date', () => {
      expect(li.find('.due-date-box')).to.have.lengthOf(1);
    });

    describe('label', () => {
      let label;
      beforeEach(() => {
        label = li.find('label').first();
      });

      it('creates single label for overdue task', () => {
        return expect(li.find('label')).to.have.length(1);
      });

      it('has `task.title` for text', () => {
        return expect(label.text()).to.equal(task.title);
      });

      it('has htmlFor set to `task.id`', () => {
        return expect(label.find(`[htmlFor="${task.id}"]`)).to.have.length(1);
      });
    });

    describe('input', () => {
      let input;
      beforeEach(() => {
        input = li.find('input').first();
      });

      it('creates single input field for overdue task', () => {
        return expect(li.find('input')).to.have.length(1);
      });

      it('has type checkbox', () => {
        return expect(input.find('[type="checkbox"]')).to.have.length(1);
      });

      it('has value set to `task.id`', () => {
        return expect(input.find(`[id="${task.id}"]`)).to.have.length(1);
      });

      it('is checked if task is complete', () => {
        return expect(input.props().checked).to.be.true;
      });

      it('is unchecked if task is not complete', () => {
        const incompleteTask = shallow(<Task task={{ status: 'needsAction' }} store={store} />).dive();

        return expect(incompleteTask.find('li input').props().checked).to.be.false;
      });

      describe('onChange', () => {
        describe('checked to unchecked', () => {
          beforeEach(() => {
            input.simulate('change', { target: { checked: false } });
          });

          it('dispatches `ASYNC_UPDATE_TASK` action with "taskStatus" `OVERDUE`', () => {
            const expectedUpdate = assign({}, task, { taskStatus: constants.TASK_STATUS.OVERDUE });
            const expectedAction = actions.asyncUpdateTask(expectedUpdate);

            return expect(store.getActions()).to.eql([expectedAction]);
          });
        });

        describe('unchecked to checked', () => {
          it('dispatches `ASYNC_UPDATE_TASK` action with "taskStatus" `COMPLETED`', () => {
            const overdueTask = { taskStatus: constants.TASK_STATUS.OVERDUE, id: 1, title: 'overdueTaskTitle' };
            const incompleteTask = shallow(<Task task={overdueTask} store={store} />).dive();

            const incompleteTaskInput = incompleteTask.find('input');
            incompleteTaskInput.simulate('change', { target: { checked: true } });

            const expectedUpdate = assign({}, overdueTask, { taskStatus: constants.TASK_STATUS.COMPLETED });
            const expectedAction = actions.asyncUpdateTask(expectedUpdate);
            expect(store.getActions()).to.eql([expectedAction]);
          });
        });
      });
    });

    describe('.due-date', () => {
      it('has date formatted as `MM/DD/YYYY`', () => {
        const dueDate = li.find('.due-date-box');
        expect(dueDate.text()).to.include('10/01/2017');
      });
    });
  });
});
