import chai from 'chai';
import chrome from 'sinon-chrome';
import sinon from 'sinon';
import fetchMock from 'fetch-mock';
import _ from 'lodash';
import * as googleTasksService from '../../src/js/googleTasksService';
import {fn as momentProto} from 'moment';

chai.should();
chai.use(require('chai-as-promised'));

const authToken = 'receivedAuthToken';
beforeEach(() => {
  chrome.identity.getAuthToken.yields(authToken);
  // noinspection JSPrimitiveTypeWrapperUsage -- need to inject chrome globally
  global.chrome = chrome;
});

afterEach(fetchMock.restore);

function stubResponseFor(urlMatch, response) {
  fetchMock.getOnce({
    matcher: urlMatch,
    response: response,
    headers: {
      'Authorization': 'OAuth ' + authToken
    }
  });
}

describe('googleTasksServiceSpec', () => {
  describe('test getOverdueTaskCount', () => {
    it('calls error handler on 4XX status code when querying for task lists', () => {
      stubResponseFor('https://www.googleapis.com/tasks/v1/users/@me/lists', 403);

      const errorHandler = sinon.spy();

      return googleTasksService.getOverdueTaskCount(_.identity, errorHandler)
        .then(() => {
          return errorHandler.calledOnce.should.be.true;
        });
    });

    it('calls error handler on 4XX status code on any tasks query', () => {
      stubResponseFor('https://www.googleapis.com/tasks/v1/users/@me/lists', {
        items: [{id: 1}, {id: 2}]
      });
      stubResponseFor('begin:https://www.googleapis.com/tasks/v1/lists/1/tasks', {});
      stubResponseFor('begin:https://www.googleapis.com/tasks/v1/lists/2/tasks', 403);

      const errorHandler = sinon.spy();

      return googleTasksService.getOverdueTaskCount(_.identity, errorHandler)
        .then(() => {
          return errorHandler.calledOnce.should.be.true;
        });
    });

    it('only queries for incomplete tasks', () => {
      stubResponseFor('https://www.googleapis.com/tasks/v1/users/@me/lists', {
        items: [{id: 1}]
      });

      stubResponseFor(url => {
        return url.startsWith('https://www.googleapis.com/tasks/v1/lists/') &&
          url.includes('showCompleted=false');
      }, {});

      return googleTasksService.getOverdueTaskCount(_.identity).should.eventually.equal(0);
    });

    it('only queries for overdue tasks', () => {
      const sandbox = sinon.sandbox.create();
      sandbox.stub(momentProto, 'utcOffset');

      const fakeTime = '2017-10-15T09:00:00.000Z';
      momentProto.utcOffset.withArgs(0, true).returns({
        toISOString: _.constant(fakeTime)
      });

      stubResponseFor('https://www.googleapis.com/tasks/v1/users/@me/lists', {
        items: [{id: 1}]
      });
      stubResponseFor(url => {
        return url.startsWith('https://www.googleapis.com/tasks/v1/lists/') && url.includes('dueMax=' + encodeURIComponent(fakeTime));
      }, {});

      return googleTasksService.getOverdueTaskCount(_.identity).should.eventually.equal(0);
    });

    it('returns 0 when no overdue tasks', () => {
      stubResponseFor('https://www.googleapis.com/tasks/v1/users/@me/lists', {items: [{id: 1}, {id: 2}]});
      stubResponseFor('begin:https://www.googleapis.com/tasks/v1/lists/', {});

      return googleTasksService.getOverdueTaskCount(_.identity).should.eventually.equal(0);
    });

    it('returns sum of overdue tasks across all task lists', () => {
      stubResponseFor('https://www.googleapis.com/tasks/v1/users/@me/lists', {items: [{id: 1}, {id: 2}]});
      stubResponseFor('begin:https://www.googleapis.com/tasks/v1/lists/', {items: [{id: _.uniqueId()}]});

      return googleTasksService.getOverdueTaskCount(_.identity).should.eventually.equal(2);
    });
  });
});