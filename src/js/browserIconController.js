function handleOverdueTasks(overdueTasks) {
  const overdueTaskCount = overdueTasks.length;
  const badgeText = overdueTaskCount ? overdueTaskCount.toString() : '';
  const iconPath = overdueTaskCount ? '/public/images/checkmark_red.png' : '/public/images/checkmark_green.png';
  const warningRed = '#a40909';

  chrome.browserAction.setBadgeText({ text: badgeText });
  chrome.browserAction.setBadgeBackgroundColor({ color: warningRed });
  chrome.browserAction.setIcon({ path: iconPath });
}

function taskCallErrorHandler() {
  chrome.browserAction.setIcon({ path: '/public/images/checkmark_gray.png' });
}

export default {
  handleOverdueTasks: handleOverdueTasks,
  taskCallErrorHandler: taskCallErrorHandler,
};
