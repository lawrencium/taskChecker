import 'whatwg-fetch';
import _ from 'lodash';
import url from 'url';
import moment from 'moment';

/* eslint no-console: ["error", { allow: ["error"] }] */

const baseUrl = 'https://www.googleapis.com/tasks/v1';

function getOverdueTasks(dataHandler, errorHandler) {
  const taskListsPromise = getTaskLists()
    .then(asJson);

  return taskListsPromise
    .then((taskListJson) => {
      return googleAuthTokenPromise()
        .then((authToken) => {
          const withAuthToken = {
            Authorization: `Bearer ${authToken}`,
          };

          const tasksQueries = _.map(taskListJson.items, (taskList) => {
            const taskListId = taskList.id;

            const currentDateWithoutTimezone = moment().utcOffset(0, true)
              .toISOString();
            const queryParameters = url.format({
              query: {
                showCompleted: false,
                dueMax: currentDateWithoutTimezone,
              },
            });
            const tasksQueryUrl = `${baseUrl}/lists/${taskListId}/tasks${queryParameters}`;
            return fetch(tasksQueryUrl, {
              method: 'GET',
              headers: withAuthToken,
            })
              .then(asJson);
          });
          return Promise.all(tasksQueries)
            .then((tasksQueryResponses) => {
              const allOverdueTasks = _.flatten(_.map(tasksQueryResponses, tasksQueryResponse => tasksQueryResponse.items));
              return _.filter(allOverdueTasks, _.isObjectLike);
            })
            .then(overdueTasks => dataHandler(overdueTasks));
        });
    })
    .catch((err) => {
      console.error('Something went wrong...', err.toString());
      errorHandler(err);
    });
}

function upsertTask(taskResource, dataHandler) {
  return googleAuthTokenPromise()
    .then((authToken) => {
      const withAuthTokenAndContentType = {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      };

      return fetch(taskResource.selfLink, {
        method: 'PUT',
        headers: withAuthTokenAndContentType,
        body: JSON.stringify(taskResource),
      })
        .then(asJson)
        .then(updatedTask => dataHandler(updatedTask));
    });
}

function getTaskLists() {
  return googleAuthTokenPromise()
    .then((authToken) => {
      const withAuthToken = {
        Authorization: `Bearer ${authToken}`,
      };

      return fetch(`${baseUrl}/users/@me/lists`, {
        method: 'GET',
        headers: withAuthToken,
      });
    });
}

function googleAuthTokenPromise() {
  return new Promise((resolve) => {
    chrome.identity.getAuthToken({ interactive: true }, resolve);
  });
}

function asJson(response) {
  if (response.status >= 400) {
    const error = new Error(`Unexpected response status ${response.statusText}`);
    error.response = response;
    throw error;
  } else {
    return response.json();
  }
}

export default {
  getOverdueTasks: getOverdueTasks,
  upsertTask: upsertTask,
};

