import 'whatwg-fetch';
import _ from 'lodash';
import url from 'url';
import moment from 'moment';

const baseUrl = 'https://www.googleapis.com/tasks/v1';

export function getOverdueTaskCount(dataHandler) {
  const taskListsPromise = getTaskLists();

  return taskListsPromise
    .then(taskListJson => {
      return googleAuthTokenPromise()
        .then(authToken => {
          const withAuthToken = {
            Authorization: 'OAuth ' + authToken
          };

          const tasksQueries = _.map(taskListJson.items, taskList => {
            const taskListId = taskList.id;

            const currentDateWithoutTimezone = moment().utcOffset(0, true)
              .toISOString();
            const queryParameters = url.format({query: {
              showCompleted: false,
              dueMax: currentDateWithoutTimezone
            }});
            const tasksQueryUrl = baseUrl + '/lists/' + taskListId + '/tasks' + queryParameters;
            return fetch(tasksQueryUrl, {
              method: 'GET',
              headers: withAuthToken
            })
              .then(asJson);
          });
          return Promise.all(tasksQueries)
            .then(tasksQueryResponses => {
              const allOverdueTasks = _.flatten(_.map(tasksQueryResponses, tasksQueryResponse => tasksQueryResponse.items));
              return _.filter(allOverdueTasks, _.isObjectLike).length;
            })
            .then(numberOverdueTasks => dataHandler(numberOverdueTasks));
        });
    });
}

function getTaskLists() {
  return googleAuthTokenPromise()
    .then(authToken => {
      const withAuthToken = {
        Authorization: 'OAuth ' + authToken
      };

      return fetch(baseUrl + '/users/@me/lists', {
        method: 'GET',
        headers: withAuthToken
      })
        .then(asJson);
    });
}

function googleAuthTokenPromise() {
  return new Promise(function (resolve) {
    chrome.identity.getAuthToken({interactive: true}, resolve);
  });
}

function asJson(response) {
  if (response.status >= 400) {
    const error = new Error('Unexpected response status ' + response.statusText);
    error.response = response;
    throw error;
  } else {
    return response.json();
  }
}

