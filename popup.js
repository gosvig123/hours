document.addEventListener("DOMContentLoaded", () => {
  const unrealButton = document.getElementById("unreal-button");
  const leagueList = document.getElementById("league-list");
  const sendData = document.getElementById("send-data");

  // Function to generate and display the league list
  function displayLeagueList(leagues) {
    leagues.forEach((league) => {
      const li = document.createElement("ul");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = true;
      checkbox.classList.add("checkbox");
      li.appendChild(checkbox);
      li.appendChild(document.createTextNode(league.leagueName)); // show teamId instead of leagueName
      leagueList.appendChild(li);
    });
  }

  chrome.storage.local.get(["teamIds"], (result) => {
    const teamIds = result.teamIds;
    if (teamIds) {
      displayLeagueList(teamIds);
    }
  });

  sendData.addEventListener("click", () => {
    passLeagueList();
  });

  unrealButton.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "getEspnInfo" });
  });
});

async function passLeagueList() {
  await fetch("https://eocy7xljz6ao3x5.m.pipedream.net/update", {
    method: "PATCH",
    headers: {},
    body: JSON.stringify({
      extension_token: "token from the extension",
      id: "1684616983768x979685721224051500",
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      displayLeagueList(data.competitions);
    });
}
