chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    if (request.action === 'getEspnInfo') {
      // Send the message to the current tab
      chrome.tabs.query(
        { active: true, currentWindow: true },
        (tabs) => {
          // Check if there is an active tab
          if (tabs[0] && tabs[0].id) {
            // Send message to the activeTab and expect a response
            chrome.tabs.sendMessage(
              tabs[0].id,
              { action: 'getEspnInfo' },
              (response) => {
                if (
                  response &&
                  response.teamIds &&
                  response.SWID &&
                  response.espnCookies
                ) {
                  chrome.storage.local.set(
                    {
                      teamIds: response.teamIds,
                      SWID: response.SWID,
                      espnCookies: response.espnCookies,
                    },
                    () => {
                      chrome.runtime.sendMessage({
                        action: 'dataStored',
                      });
                    }
                  );
                }
              }
            );
          } else {
            console.error('No active tab found');
          }
        }
      );
      return true; 
    }
  }
);
