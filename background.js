chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    if (request.action === 'getEspnInfo') {
      // Send the message to the current tab
      chrome.tabs.query(
        { lastFocusedWindow: true, currentWindow: true },
        (tabs) => {
          const activeTab = tabs.find((tab) => tab.active);
          if (activeTab && activeTab.id) {
            // Send message to the activeTab and expect a response
            chrome.tabs.sendMessage(
              activeTab.id,
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
