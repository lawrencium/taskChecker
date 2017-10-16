export function handleOverdueTaskCount(overdueTaskCount) {
  const badgeText = overdueTaskCount ? overdueTaskCount.toString() : '';
  const iconPath = overdueTaskCount ? '/public/images/checkmark_red.png' : '/public/images/checkmark_green.png';
  const warningRed = '#a40909';

  chrome.browserAction.setBadgeText({text: badgeText});
  chrome.browserAction.setBadgeBackgroundColor({color: warningRed});
  chrome.browserAction.setIcon({path: iconPath});
}