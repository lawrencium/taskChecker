import { configure, shallow } from 'enzyme';
import chai from 'chai';
import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import configureStore from 'redux-mock-store';
import _ from 'lodash';

import OverdueTask from '../../../src/js/components/OverdueTask';
import actions from '../../../src/js/redux/actions';

const { expect } = chai;

configure({ adapter: new Adapter() });

const mockStore = configureStore();
let store;
beforeEach(() => {
  store = mockStore({});
});

describe('<OverdueTask />', () => {
  let taskComponent;
  const task = {
    id: '1', title: 'taskTitle', status: 'completed', due: '2017-10-29T00:00:00.000Z',
  };
  beforeEach(() => {
    taskComponent = shallow(<OverdueTask task={task} store={store} />).dive();
  });

  it('creates wrapping li on render()', () => {
    return expect(taskComponent.first().is('li')).to.be.true;
  });

  it('has no elements with class `completed` if task.status is not "completed"', () => {
    const incompleteTask = {
      id: '1', title: 'taskTitle', status: 'needsAction', due: '2017-10-29T00:00:00.000Z',
    };
    const incompleteTaskComponent = shallow(<OverdueTask task={incompleteTask} store={store} />).dive();

    expect(incompleteTaskComponent.find('.completed')).to.have.lengthOf(0);
  });

  it('has elements with class `completed` if task.status is "completed"', () => {
    expect(taskComponent.find('.completed').length).to.be.above(0);
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
        const incompleteTask = shallow(<OverdueTask task={{ status: 'needsAction' }} store={store} />).dive();

        return expect(incompleteTask.find('li input').props().checked).to.be.false;
      });

      describe('onChange', () => {
        describe('checked to unchecked', () => {
          beforeEach(() => {
            input.simulate('change', { target: { checked: false } });
          });

          it('dispatches `ASYNC_UPSERT_TASK` action with task "status" `needsAction` and "completed" `undefined`', () => {
            const expectedUpsert = _.assign({}, task, { status: 'needsAction', completed: undefined });
            const expectedAction = actions.asyncUpsertOverdueTask(expectedUpsert);

            return expect(store.getActions()).to.eql([expectedAction]);
          });
        });

        describe('unchecked to checked', () => {
          it('dispatches `ASYNC_UPSERT_TASK` action with task "status" `completed` and "completed" undefined', () => {
            const overdueTask = { status: 'needsAction', id: 1, title: 'overdueTaskTitle' };
            const incompleteTask = shallow(<OverdueTask task={overdueTask} store={store} />).dive();

            const incompleteTaskInput = incompleteTask.find('input');
            incompleteTaskInput.simulate('change', { target: { checked: true } });

            const expectedUpsert = _.assign({}, overdueTask, { status: 'completed', completed: undefined });
            const expectedAction = actions.asyncUpsertOverdueTask(expectedUpsert);
            expect(store.getActions()).to.eql([expectedAction]);
          });
        });
      });
    });

    describe('.due-date', () => {
      it('has date formatted as `MM/DD/YYYY`', () => {
        const dueDate = li.find('.due-date-box');
        expect(dueDate.text()).to.include('10/29/2017');
      });
    });
  });
});
