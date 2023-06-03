const leagueList = document.getElementById('league-list');
const leaguesHeader = document.getElementById('leagues-header');

document.addEventListener('DOMContentLoaded', () => {
  const unrealButton = document.getElementById('unreal-button');
  const sendData = document.getElementById('send-data');
  const buttonContainer = document.getElementById('button-container');

  chrome.storage.local.get(['teamIds'], (result) => {
    if (result.teamIds) {
      displayLeagueList(result.teamIds);
      buttonContainer.style.display = 'none';
    }
  });

  sendData.addEventListener('click', () => {
    passLeagueList();

    sendData.style.display = 'none';
    leagueList.style.display = 'none';
    leaguesHeader.innerText = 'Your Leagues has been connected';
  });

  unrealButton.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'getEspnInfo' });
    buttonContainer.style.display = 'none';
    chrome.storage.local.get(['teamIds'], (result) => {
      if (result.teamIds) {
        displayLeagueList(teamIds.teamIds);
        buttonContainer.style.display = 'none';
      }
    });
  });
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
    checkbox.type = 'checkbox';
    checkbox.checked = true;
    checkbox.classList.add('checkbox');
    li.appendChild(checkbox);
    li.appendChild(document.createTextNode(league.leagueName)); // show teamId instead of leagueName
    leagueList.appendChild(li);
  });
}
