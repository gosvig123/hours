document.addEventListener("DOMContentLoaded", () => {
  const unrealButton = document.getElementById("unreal-button");
  const leagueList = document.getElementById("league-list");

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

  unrealButton.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "getEspnInfo" });
  });
});
