const leagueList = document.getElementById('league-list');
const leaguesHeader = document.getElementById('leagues-header');
const userId = chrome.storage.local.get('userId');
const leaguesFromStorage = chrome.storage.local.get('teamIds');
const connectUser = document.getElementById('connect-user');
const connectLeague = document.getElementById('unreal-button');
const espnContainer = document.getElementById('connect-espn');
const leagues = document.getElementById('leagues');
const notifications = document.getElementById('notifications');
const userInfo = document.getElementById('user-info');
const connectAccountButton = document.getElementById('connect-ur');

document.addEventListener('DOMContentLoaded', () => {
  leagues.style.display = 'none';
  chrome.storage.local.get(['phone'], function (result) {
    if (result && result.phone) {
      userInfo.innerText = `You are logged in as ${result.phone}`;
      connectUser.style.display = 'none';

      userInfo.classList.add('active');
    } else {
      espnContainer.style.display = 'none';
    }
  });

  connectAccountButton.addEventListener('click', () => {
    chrome.tabs.update({ url: 'https://siders.ai/espn_ext' });
  });

  getActiveUrl().then((currentUrl) => {
    if (currentUrl.includes('espn.com')) {
      chrome.runtime.sendMessage({ action: 'getLeagues' });
    }
    if (currentUrl.includes('/espn_ext')) {
      chrome.runtime.sendMessage({ action: 'getUserId' });
    }
  });

  setInterval(() => {
    getActiveUrl().then((currentUrl) => {
      if (currentUrl.includes('espn.com')) {
        chrome.runtime.sendMessage({ action: 'getEspnInfo' });
      }
      if (currentUrl.includes('/espn_ext')) {
        chrome.runtime.sendMessage({ action: 'getUserId' });
      }
    });
  }, 2000);

  getLeaguesFromStorage().then((league) => {
    if (league) {
      displayLeagueList(league);
      // connectUser.style.display = 'none';
      connectLeague.innerText = 'Connect More ESPN Leagues';
    } else {
      leaguesHeader.innerText = '';
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
        chrome.storage.local.get(
          ['teamIds', 'SWID', 'espnCookies', 'userId'],
          (result) => {
            if (result.teamIds) {
              displayLeagueList(result.teamIds);
              const teamId = result.teamIds.map((team) => {
                return (team = team.teamId);
              });
              leagueName = result.teamIds.map((team) => {
                return (team = team.leagueName);
              });

              showSuccess(
                'You have now connected your espn leagues to siders.ai, you will be redirected back to siders.ai in a few seconds'
              );
              connectLeague.style.display = 'none';
              passLeagueList(
                result.SWID,
                result.espnCookies,
                teamId,
                leagueName,
                result.userId
              );

              setTimeout(() => {
                // change the site to espn
                chrome.tabs.update({
                  url: 'https://siders.ai/espn_choose',
                });
              }, 5000);
            }
          }
        );
      }
      if (request.action === 'weGotLeagues') {
        console.log('we got leagues');
      }

      let count = 0;
      if (request.action === 'noLeagues') {
        count++;
        if (count === 3) {
          showError(
            'Please make sure you are logged in and have joined at least 1 league'
          );
          espnContainer.style.display = 'none';
        }
      }

      if (request.action === 'userIdStored') {
        chrome.storage.local.get(['phone'], function (result) {
          userInfo.innerText = `You are logged in as ${result.phone}`;
          connectUser.style.display = 'none';

          userInfo.classList.add('active');
          espnContainer.style.display = 'flex';
        });
      }
    }
  );
});

async function passLeagueList(
  swid,
  s2,
  leagueIds,
  leagueName,
  userId
) {
  await fetch('https://eorl6hfxaywlbm6.m.pipedream.net/update', {
    method: 'PATCH',
    headers: {},
    body: JSON.stringify({
      id: userId,
      espn_SWID: swid,
      espn_s2: s2,
      espn_league_id: leagueIds,
      espn_league: leagueName,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      displayLeagueList(data.competitions);
    });
}

let addedLeagues = new Set();

function displayLeagueList(leagues) {
  leagues.forEach((league) => {
    if (!addedLeagues.has(league.leagueName)) {
      const li = document.createElement('li');
      li.appendChild(document.createTextNode(league.leagueName));
      leagueList.appendChild(li);
      addedLeagues.add(league.leagueName);
    }
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
        resolve(result);
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

function showError(message) {
  const notificationsDiv = document.getElementById('notifications');
  notificationsDiv.textContent = message;
  notificationsDiv.classList.add('active');
}

function hideError() {
  const notificationsDiv = document.getElementById('notifications');
  notificationsDiv.textContent = '';
  notificationsDiv.classList.remove('active');
}

function showSuccess(message) {
  const notificationsDiv = document.getElementById('notifications');
  notificationsDiv.textContent = message;
  notificationsDiv.classList.add('active', 'success');
}
