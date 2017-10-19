import chai from 'chai';
import chrome from 'sinon-chrome';
import sinon from 'sinon';
import fetchMock from 'fetch-mock';
import _ from 'lodash';
import { fn as momentProto } from 'moment';
import googleTasksService from '../../src/js/GoogleTasksService';

chai.use(require('chai-as-promised'));

const { expect } = chai;

const authToken = 'receivedAuthToken';
beforeEach(() => {
  chrome.identity.getAuthToken.yields(authToken);
  // noinspection JSPrimitiveTypeWrapperUsage -- need to inject chrome globally
  global.chrome = chrome;
});

beforeEach(fetchMock.restore);
afterEach(() => {
  return expect(fetchMock.done()).to.be.true;
});

function stubResponseFor(urlMatch, response) {
  fetchMock.getOnce({
    matcher: urlMatch,
    response: response,
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
}

describe('googleTasksServiceSpec', () => {
  describe('test getOverdueTasks', () => {
    it('calls error handler on 4XX status code when querying for task lists', () => {
      stubResponseFor('https://www.googleapis.com/tasks/v1/users/@me/lists', 403);

      const errorHandler = sinon.spy();

      return googleTasksService.getOverdueTasks(_.identity, errorHandler)
        .then(() => {
          return expect(errorHandler.calledOnce).to.be.true;
        });
    });

    it('calls error handler on 4XX status code on any tasks query', () => {
      stubResponseFor('https://www.googleapis.com/tasks/v1/users/@me/lists', {
        items: [{ id: 1 }, { id: 2 }],
      });
      stubResponseFor('begin:https://www.googleapis.com/tasks/v1/lists/1/tasks', {});
      stubResponseFor('begin:https://www.googleapis.com/tasks/v1/lists/2/tasks', 403);

      const errorHandler = sinon.spy();

      return googleTasksService.getOverdueTasks(_.identity, errorHandler)
        .then(() => {
          return expect(errorHandler.calledOnce).to.be.true;
        });
    });

    it('only queries for incomplete tasks', () => {
      stubResponseFor('https://www.googleapis.com/tasks/v1/users/@me/lists', {
        items: [{ id: 1 }],
      });

      stubResponseFor((url) => {
        return url.startsWith('https://www.googleapis.com/tasks/v1/lists/') &&
          url.includes('showCompleted=false');
      }, {});

      return expect(googleTasksService.getOverdueTasks(_.identity)).to.be.fulfilled;
    });

    it('only queries for overdue tasks', () => {
      const sandbox = sinon.sandbox.create();
      sandbox.stub(momentProto, 'utcOffset');

      const fakeTime = '2017-10-15T09:00:00.000Z';
      momentProto.utcOffset.withArgs(0, true).returns({
        toISOString: _.constant(fakeTime),
      });

      stubResponseFor('https://www.googleapis.com/tasks/v1/users/@me/lists', {
        items: [{ id: 1 }],
      });
      stubResponseFor((url) => {
        return url.startsWith('https://www.googleapis.com/tasks/v1/lists/') && url.includes(`dueMax=${encodeURIComponent(fakeTime)}`);
      }, {});

      return expect(googleTasksService.getOverdueTasks(_.identity)).to.be.fulfilled;
    });

    it('returns empty list when no overdue tasks', () => {
      stubResponseFor('https://www.googleapis.com/tasks/v1/users/@me/lists', { items: [{ id: 1 }, { id: 2 }] });
      stubResponseFor('begin:https://www.googleapis.com/tasks/v1/lists/', {});

      return expect(googleTasksService.getOverdueTasks(_.identity)).to.eventually.be.empty;
    });

    it('returns list of overdue tasks across all task lists', () => {
      stubResponseFor('https://www.googleapis.com/tasks/v1/users/@me/lists', { items: [{ id: 1 }, { id: 2 }] });
      stubResponseFor('begin:https://www.googleapis.com/tasks/v1/lists/', { items: [{ id: _.uniqueId() }] });

      return expect(googleTasksService.getOverdueTasks(_.identity)).to.eventually.have.lengthOf(2);
    });

    it('calls data handler on overdue tasks', () => {
      stubResponseFor('https://www.googleapis.com/tasks/v1/users/@me/lists', { items: [] });

      const dataHandler = sinon.spy();
      return googleTasksService.getOverdueTasks(dataHandler)
        .then(() => {
          return expect(dataHandler.calledOnce).to.be.true;
        });
    });
  });

  describe('test upsertTask', () => {
    const urlToPut = 'someUrl';
    const taskResource = {
      selfLink: urlToPut,
      someParam: 1,
      anotherParam: 'blah blah blah',
      status: 'completed',
    };

    it('sends PUT request to url specified in the selfLink property of task and attaches auth token & content-type headers', () => {
      fetchMock.putOnce({
        matcher: urlToPut,
        response: {},
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      return expect(googleTasksService.upsertTask(taskResource, _.identity)).to.be.fulfilled;
    });

    it('request body has the same properties as the task resource', () => {
      fetchMock.putOnce({
        matcher: (url, opts) => {
          return _.isEqual(JSON.parse(opts.body), taskResource);
        },
        response: {},
      });

      return expect(googleTasksService.upsertTask(taskResource, _.identity)).to.be.fulfilled;
    });

    it('rejects on 4XX status', () => {
      fetchMock.putOnce({
        matcher: urlToPut,
        response: 400,
      });

      return expect(googleTasksService.upsertTask(taskResource, _.identity)).to.be.rejected;
    });

    it('calls dataHandler on response after successful PUT', () => {
      fetchMock.putOnce({
        matcher: urlToPut,
        response: { some: 'response' },
      });

      const dataHandler = sinon.spy();
      return googleTasksService.upsertTask(taskResource, dataHandler)
        .then(() => {
          return expect(dataHandler.calledOnce).to.be.true;
        });
    });
  });
});
