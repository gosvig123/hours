const leagueList = document.getElementById('league-list');
const leaguesHeader = document.getElementById('leagues-header');
const userId = chrome.storage.local.get('userId');
const leaguesFromStorage = chrome.storage.local.get('teamIds');
const connectUser = document.getElementById('connect-user');
const connectLeague = document.getElementById('unreal-button');
const espnContainer = document.getElementById('connect-espn');
const leagues = document.getElementById('leagues');
const notifications = document.getElementById('notifications');

document.addEventListener('DOMContentLoaded', () => {
  getActiveUrl().then((currentUrl) => {
    if (currentUrl === 'https://www.espn.com/') {
      notifications.innerText = 'Please make sure you are logged in';
      connectUser.style.display = 'none';
    }
  });

  getLeaguesFromStorage().then((league) => {
    if (league) {
      displayLeagueList(league);
      // connectUser.style.display = 'none';
      connectLeague.innerText = 'Connect More Leagues';
    }
  });

  getUserId().then((userId) => {
    if (!userId) {
      espnContainer.style.display = 'none';
      leagues.style.display = 'none';
    }
  });

  connectLeague.addEventListener('click', () => {
    chrome.tabs.update({ url: 'https://espn.com' });

    setTimeout(() => {
      chrome.runtime.sendMessage({ action: 'getEspnInfo' });
      espnContainer.style.display = 'none';
    }, 3000);
  });

  chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
      if (request.action === 'dataStored') {
        // New data has been stored, retrieve it and update the display
        chrome.storage.local.get(['teamIds'], (result) => {
          if (result.teamIds) {
            displayLeagueList(result.teamIds);
            espnContainer.style.display = 'none';
            leaguesHeader.innerText = 'My Leagues';
          }
        });
      }
    }
  );
});

async function passLeagueList() {
  await fetch('https://eocy7xljz6ao3x5.m.pipedream.net/update', {
    method: 'PATCH',
    headers: {},
    body: JSON.stringify({
      extension_token: 'token from the extension',
      id: '1684616983768x979685721224051500',
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      displayLeagueList(data.competitions);
    });
}

function displayLeagueList(leagues) {
  leagues.forEach((league) => {
    const li = document.createElement('ul');
    const checkbox = document.createElement('input');
    checkbox.classList.add('checkbox');
    li.appendChild(checkbox);
    li.appendChild(document.createTextNode(league.leagueName)); // show teamId instead of leagueName
    leagueList.appendChild(li);
  });
}

async function getLeaguesFromStorage() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get('teamIds', (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result.teamIds);
      }
    });
  });
}

async function getUserId() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get('userId', (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result.userId);
      }
    });
  });
}

async function getActiveUrl() {
  const tabs = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  const currentUrl = tabs[0].url;
  return currentUrl;
}
