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
          try {
            const link = item.querySelector('a');

            const teamId = link.href
              .split('leagueId=')[1]
              .split('&')[0];
            const leagueName = item.querySelector(
              '.favItem__subHead'
            ).innerText;
            const sportsType = link.href
              .split('espn.com/')[1]
              .split('/')[0];

            const leagueInfo = {
              teamId,
              leagueName,
              sportsType,
            };

            if (!teamIds.some((team) => team.teamId === teamId)) {
              teamIds.push(leagueInfo);
            }
          } catch (error) {
            console.error(error);
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
      if (request.action === 'getUserId') {
        const userId = document.getElementById('userId').innerText;
        const phone = document.getElementById('phone').innerText;

        sendResponse({ userId: userId, phone: phone });
        return true;
      }
    } catch (error) {
      console.error('Error getting cookies:', error);
    }
  }
);
