let currentTab = null;
let startTime = null;

function updateTimeSpent(url, timeSpent) {
  chrome.storage.local.get(['timeData'], function(result) {
    let timeData = result.timeData || {};
    if (!timeData[url]) {
      timeData[url] = { daily: 0, weekly: 0, monthly: 0 };
    }
    timeData[url].daily += timeSpent;
    timeData[url].weekly += timeSpent;
    timeData[url].monthly += timeSpent;
    chrome.storage.local.set({timeData: timeData});
  });
}

function updateCurrentTab() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0]) {
      if (currentTab) {
        let timeSpent = (Date.now() - startTime) / 1000;
        updateTimeSpent(currentTab, timeSpent);
      }
      currentTab = tabs[0].url;
      startTime = Date.now();
    }
  });
}

chrome.tabs.onActivated.addListener(updateCurrentTab);
chrome.tabs.onUpdated.addListener(updateCurrentTab);
chrome.windows.onFocusChanged.addListener(updateCurrentTab);

setInterval(updateCurrentTab, 1000); // Update every second

chrome.alarms.create('resetDaily', { periodInMinutes: 1440 });
chrome.alarms.create('resetWeekly', { periodInMinutes: 10080 });
chrome.alarms.create('resetMonthly', { periodInMinutes: 43200 });

chrome.alarms.onAlarm.addListener(function(alarm) {
  chrome.storage.local.get(['timeData'], function(result) {
    let timeData = result.timeData || {};
    for (let url in timeData) {
      if (alarm.name === 'resetDaily') {
        timeData[url].daily = 0;
      } else if (alarm.name === 'resetWeekly') {
        timeData[url].weekly = 0;
      } else if (alarm.name === 'resetMonthly') {
        timeData[url].monthly = 0;
      }
    }
    chrome.storage.local.set({timeData: timeData});
  });
});