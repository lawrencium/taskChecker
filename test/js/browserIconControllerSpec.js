import chai from 'chai';
import sinon from 'sinon';
import chrome from 'sinon-chrome';
import * as browerIconController from '../../src/js/browserIconController';

chai.should();

describe('browserIconControllerSpec', () => {
  beforeEach(() => {
    global.chrome = chrome;
  });

  afterEach(() => {
    chrome.flush();
  });

  describe('test handleOverdueTaskCount', () => {
    describe('= 0', () => {
      beforeEach(() => {
        browerIconController.handleOverdueTaskCount(0);
      });

      it('sets badge text to empty string', () => {
        return chrome.browserAction.setBadgeText.calledWithExactly({text: ''}).should.be.true;
      });

      it('sets browser icon to green', () => {
        const matcher = sinon.match({path: sinon.match('checkmark_green.png')});
        return chrome.browserAction.setIcon.calledWithMatch(matcher).should.be.true;
      });
    });

    describe('> 0', () => {
      beforeEach(() => {
        browerIconController.handleOverdueTaskCount(3);
      });

      it('sets badge text to number of overdue tasks', () => {
        return chrome.browserAction.setBadgeText.calledWithExactly({text: '3'}).should.be.true;
      });

      it('sets badge text color', () => {
        return chrome.browserAction.setBadgeBackgroundColor.calledOnce.should.be.true;
      });

      it('sets browser icon to red', () => {
        const matcher = sinon.match({path: sinon.match('checkmark_red.png')});
        return chrome.browserAction.setIcon.calledWithMatch(matcher).should.be.true;
      });
    });
  });

  describe('test overdueTaskCountErrorHandler', () => {
    beforeEach(() => {
      browerIconController.overdueTaskCountErrorHandler();
    });

    it('sets browser icon to gray', () => {
      const matcher = sinon.match({path: sinon.match('checkmark_gray.png')});
      return chrome.browserAction.setIcon.calledWithMatch(matcher).should.be.true;
    });
  });
});