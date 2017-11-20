/* eslint no-console: ["error", { allow: ["error"] }] */
import 'whatwg-fetch';
import { filter, flatten, isObjectLike, map } from 'lodash';
import url from 'url';

const baseUrl = 'https://www.googleapis.com/tasks/v1';

function getTasks(query, dataHandler, errorHandler) {
  const taskListsPromise = getTaskLists()
    .then(asJson);

  return taskListsPromise
    .then((taskListJson) => {
      return googleAuthTokenPromise()
        .then((authToken) => {
          const withAuthToken = {
            Authorization: `Bearer ${authToken}`,
          };

          const tasksQueries = map(taskListJson.items, (taskList) => {
            const taskListId = taskList.id;
            const queryParameters = url.format({
              query: query,
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
              const allTasks = flatten(map(tasksQueryResponses, tasksQueryResponse => tasksQueryResponse.items));
              return filter(allTasks, isObjectLike);
            })
            .then(tasks => dataHandler(tasks));
        });
    })
    .catch((err) => {
      console.error('Something went wrong...', err.toString());
      errorHandler(err);
    });
}

function updateTask(taskResource, dataHandler) {
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

function createTask(taskResource, dataHandler) {
  return googleAuthTokenPromise()
    .then((authToken) => {
      const withAuthTokenAndContentType = {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      };

      return fetch(`${baseUrl}/lists/@default/tasks`, {
        method: 'POST',
        headers: withAuthTokenAndContentType,
        body: JSON.stringify(taskResource),
      })
        .then(asJson)
        .then(createdTask => dataHandler(createdTask));
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
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError));
      } else {
        resolve(token);
      }
    });
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
  updateTask: updateTask,
  getTasks: getTasks,
  createTask: createTask,
};

