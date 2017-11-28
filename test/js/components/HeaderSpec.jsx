import { configure, shallow } from 'enzyme';
import chai from 'chai';
import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import configureStore from 'redux-mock-store';
import chrome from 'sinon-chrome';

import Header from '../../../src/js/components/Header';
import constants from '../../../src/js/constants';

const { expect } = chai;

const mockStore = configureStore();
let store;
beforeEach(() => {
  store = mockStore({});
});
configure({ adapter: new Adapter() });

describe('<Header />', () => {
  let header;
  beforeEach(() => {
    header = shallow(<Header store={store} />).dive();
  });

  it('returns header wrapper', () => {
    expect(header.find('header.header')).to.have.length(1);
  });

  it('header does not have `overdue` class if no overdue tasks', () => {
    expect(header.find('header.header.overdue')).to.have.length(0);
  });

  it('header has `overdue` class if there are overdue tasks', () => {
    store = mockStore({ 1: { taskStatus: constants.TASK_STATUS.OVERDUE } });
    const overdueHeader = shallow(<Header store={store} />).dive();

    expect(overdueHeader.find('header.header.overdue')).to.have.length(1);
  });

  describe('.header-left', () => {
    it('has text', () => {
      return expect(header.find('.header-left').first().text()).to.not.be.empty;
    });
  });

  describe('external-link on click', () => {
    beforeEach(() => {
      global.chrome = chrome;
    });

    afterEach(() => {
      chrome.flush();
    });

    it('opens a single tab', () => {
      const externalLinkButton = header.find('.external-link');
      externalLinkButton.simulate('click');

      return expect(chrome.tabs.create.calledOnce).to.be.true;
    });

    it('tab links to `https://mail.google.com/tasks/canvas`', () => {
      const externalLinkButton = header.find('.external-link');
      externalLinkButton.simulate('click');

      return expect(chrome.tabs.create.calledWith({ url: 'https://mail.google.com/tasks/canvas' })).to.be.true;
    });
  });
});
