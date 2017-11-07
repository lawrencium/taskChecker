import chai from 'chai';
import sinon from 'sinon';
import chrome from 'sinon-chrome';
import browerIconController from '../../src/js/browserIconController';

const { expect } = chai;

describe('browserIconControllerSpec', () => {
  beforeEach(() => {
    global.chrome = chrome;
  });

  afterEach(() => {
    chrome.flush();
  });

  describe('test handleOverdueTasks', () => {
    describe('empty list', () => {
      beforeEach(() => {
        browerIconController.handleOverdueTasks([]);
      });

      it('sets badge text to empty string', () => {
        return expect(chrome.browserAction.setBadgeText.calledWithExactly({ text: '' })).to.be.true;
      });

      it('sets browser icon to green', () => {
        const matcher = sinon.match({ path: sinon.match('checkmark_green.png') });
        return expect(chrome.browserAction.setIcon.calledWithMatch(matcher)).to.be.true;
      });
    });

    describe('nonempty list', () => {
      beforeEach(() => {
        browerIconController.handleOverdueTasks([{ id: 1 }, { id: 2 }, { id: 3 }]);
      });

      it('sets badge text to number of overdue tasks', () => {
        return expect(chrome.browserAction.setBadgeText.calledWithExactly({ text: '3' })).to.be.true;
      });

      it('sets badge text color', () => {
        return expect(chrome.browserAction.setBadgeBackgroundColor.calledOnce).to.be.true;
      });

      it('sets browser icon to red', () => {
        const matcher = sinon.match({ path: sinon.match('checkmark_red.png') });
        return expect(chrome.browserAction.setIcon.calledWithMatch(matcher)).to.be.true;
      });
    });
  });

  describe('test taskCallErrorHandler', () => {
    beforeEach(() => {
      browerIconController.taskCallErrorHandler();
    });

    it('sets browser icon to gray', () => {
      const matcher = sinon.match({ path: sinon.match('checkmark_gray.png') });
      return expect(chrome.browserAction.setIcon.calledWithMatch(matcher)).to.be.true;
    });
  });
});
