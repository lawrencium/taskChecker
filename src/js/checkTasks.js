function checkTasks() {
  chrome.identity.getAuthToken({interactive: true}, function (token) {
    const baseUrl = 'https://www.googleapis.com/tasks/v1';
    const warningRed = '#a40909';

    const withAuthToken = {
      Authorization: "OAuth " + token
    };

    $.ajax({
      url: baseUrl + '/users/@me/lists',
      headers: withAuthToken,
      success: function (data) {
        const taskLists = data.items;
        const taskIds = _.map(taskLists, function (task) {
          return task.id;
        });

        const endOfToday = moment().format('YYYY-M-D[T]23:59:59.999[Z]');
        const queryForTasks = _.map(taskIds, function (taskId) {
          return $.ajax({
            url: baseUrl + '/lists/' + taskId + '/tasks',
            headers: withAuthToken,
            data: {
              dueMax: endOfToday
            },
            error: function (err) {
              console.error('Something went wrong when retrieving tasks', err);
              chrome.browserAction.setIcon({
                path: '../../public/images/checkmark_gray.png'
              });
            }
          });
        });

        Promise.all(queryForTasks)
          .then(function (results) {
            const incompleteTasks = _.filter(_.flatten(_.map(results, function (result) {
              return result.items;
            })), function (task) {
              return !_.isNil(task) && task.status !== 'completed'
            });
            const totalTasksDue = incompleteTasks.length;

            if (totalTasksDue > 0) {
              chrome.browserAction.setBadgeText({text: totalTasksDue.toString()});
              chrome.browserAction.setBadgeBackgroundColor({color: warningRed});
              chrome.browserAction.setIcon({
                path: '../../public/images/checkmark_red.png'
              });
            } else {
              chrome.browserAction.setIcon({
                path: '../../public/images/checkmark_green.png'
              });
              chrome.browserAction.setBadgeText({text: ''});
            }
          });
      },
      error: function (err) {
        console.error('Something went wrong when retrieving task lists', err);
        chrome.browserAction.setIcon({
          path: '../../public/images/checkmark_gray.png'
        });
      }
    });
  });
}

chrome.alarms.create('periodicallyCheckTasks', {delayInMinutes: 1, periodInMinutes: 1});
checkTasks();
chrome.alarms.onAlarm.addListener(function () {
  checkTasks();
});
chrome.browserAction.onClicked.addListener(function () {
  checkTasks();
  chrome.tabs.create({url: 'https://mail.google.com/tasks/canvas'})
});
checkTasks();