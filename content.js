chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    try {
      if (request.action === 'getEspnInfo') {
        const cookies = document.cookie;
        const SWID =
          '{' + cookies.split('SWID={')[1].split('}')[0] + '}';
        const espnCookies = cookies
          .split('espn_s2=')[1]
          .split(';')[0];

        const favItems = document.querySelectorAll(
          '#fantasy-feed-items .favItem'
        );
        let teamIds = [];

        favItems.forEach((item) => {
          const link = item.querySelector('a');

          const teamId = link.href
            .split('leagueId=')[1]
            .split('&')[0];
          const leagueName = item.querySelector(
            '.favItem__subHead'
          ).innerText;

          const leagueInfo = {
            teamId,
            leagueName,
          };

          if (!teamIds.some((team) => team.teamId === teamId)) {
            teamIds.push(leagueInfo);
          }
        });

        sendResponse({
          teamIds: teamIds,
          SWID: SWID,
          espnCookies: espnCookies,
        });
        return true;

        // send back the message with the teamIds
      }
      if (request.action === 'getLeagues') {
        const leagues = document.querySelector(
          '#fantasy-feed-items .favItem'
        );
        console.log(leagues);

        if (leagues) {
          const numberOfLeagues = leagues.childNodes.length;

          if (numberOfLeagues) {
            sendResponse({ leagues: true });
          } else {
            sendResponse({ leagues: false });
          }
        } else {
          console.error('#fantasy-feed-items not found ');
          sendResponse({ error: '#fantasy-feed-items not found' });
        }
      }
    } catch (error) {
      console.error('Error getting cookies:', error);
    }
  }
);
