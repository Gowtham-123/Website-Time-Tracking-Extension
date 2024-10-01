let currentView = 'daily';

function updateTable() {
  chrome.storage.local.get(['timeData'], function(result) {
    let timeData = result.timeData || {};
    let table = document.getElementById('timeTable');
    table.innerHTML = '<tr><th>Website</th><th>Time Spent</th></tr>';
    
    // Consolidate and sum up time for each unique hostname
    let consolidatedData = {};
    for (let url in timeData) {
      let hostname = new URL(url).hostname;
      if (!consolidatedData[hostname]) {
        consolidatedData[hostname] = { time: 0, favicon: url };
      }
      consolidatedData[hostname].time += timeData[url][currentView];
    }
    
    // Convert consolidated data to array and sort
    let sortedData = Object.entries(consolidatedData)
      .map(([hostname, data]) => ({
        hostname: hostname,
        time: data.time,
        favicon: data.favicon
      }))
      .sort((a, b) => b.time - a.time);

    for (let item of sortedData) {
      if (item.time > 0) {  // Only display websites with non-zero time
        let row = table.insertRow(-1);
        let cellUrl = row.insertCell(0);
        let cellTime = row.insertCell(1);
        
        let favicon = document.createElement('img');
        favicon.src = 'https://www.google.com/s2/favicons?domain=' + item.hostname;
        favicon.className = 'favicon';
        
        let websiteName = document.createElement('span');
        websiteName.textContent = item.hostname;
        websiteName.className = 'website-name';
        
        cellUrl.appendChild(favicon);
        cellUrl.appendChild(websiteName);
        cellTime.textContent = formatTime(item.time);
      }
    }
  });
}

function formatTime(seconds) {
  let hours = Math.floor(seconds / 3600);
  let minutes = Math.floor((seconds % 3600) / 60);
  seconds = Math.floor(seconds % 60);
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function pad(num) {
  return num.toString().padStart(2, '0');
}

function setActiveButton(buttonId) {
  document.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(buttonId).classList.add('active');
}

document.addEventListener('DOMContentLoaded', function() {
  updateTable();
  setInterval(updateTable, 1000); // Update every second
  
  document.getElementById('dailyBtn').addEventListener('click', function() {
    currentView = 'daily';
    setActiveButton('dailyBtn');
    updateTable();
  });
  
  document.getElementById('weeklyBtn').addEventListener('click', function() {
    currentView = 'weekly';
    setActiveButton('weeklyBtn');
    updateTable();
  });
  
  document.getElementById('monthlyBtn').addEventListener('click', function() {
    currentView = 'monthly';
    setActiveButton('monthlyBtn');
    updateTable();
  });
});