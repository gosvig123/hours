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
      connectUser.style.display = 'none';
    }
    //TODO check if user is logged in an otherwise prompt them to log in.
    // notifications.innerText = 'Please make sure you are logged in';
  });

  getLeaguesFromStorage().then((league) => {
    if (league) {
      displayLeagueList(league);
      // connectUser.style.display = 'none';
      connectLeague.innerText = 'Connect More Leagues';
    } else {
      leaguesHeader.innerText = '';
    }
  });

  getUserId().then((userId) => {
    if (!userId) {
      // espnContainer.style.display = 'none';
      // leagues.style.display = 'none';
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
          ['teamIds', 'SWID', 'espnCookies'],
          (result) => {
            if (result.teamIds) {
              displayLeagueList(result.teamIds);
              const teamId = result.teamIds.map((team) => {
                return (team = team.teamId);
              });
              leagueName = result.teamIds.map((team) => {
                return (team = team.leagueName);
              });

              leaguesHeader.innerText = 'My Connected Leagues';

              passLeagueList(
                result.SWID,
                result.espnCookies,
                teamId,
                leagueName
              );
            }
          }
        );
      }
    }
  );
});

async function passLeagueList(swid, s2, leagueIds, leagueName) {
  await fetch('https://eocy7xljz6ao3x5.m.pipedream.net/update', {
    method: 'PATCH',
    headers: {},
    body: JSON.stringify({
      id: '1685194602638x406907844304061700',
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

function displayLeagueList(leagues) {
  leagues.forEach((league) => {
    const li = document.createElement('li'); // Changed from 'ul' to 'li'
    li.appendChild(document.createTextNode(league.leagueName));
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
