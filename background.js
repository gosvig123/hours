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
    if (request.action === 'getLeagues') {
      chrome.tabs.query(
        { active: true, currentWindow: true },
        (tabs) => {
          if (tabs[0] && tabs[0].id) {
            chrome.tabs.sendMessage(
              tabs[0].id,
              { action: 'getLeagues' },
              (response) => {
                if (response) {
                  chrome.runtime.sendMessage({
                    action: 'weGotLeagues',
                  });
                } else {
                  chrome.runtime.sendMessage({ action: 'noLeagues' });
                }
              }
            );
          }
        }
      );
    }
    if (request.action === 'getUserId') {
      try {
        chrome.tabs.query(
          { active: true, currentWindow: true },
          (tabs) => {
            let tab = tabs[0];

            if (tab && tab.id && tab.status === 'complete') {
              chrome.tabs.sendMessage(
                tab.id,
                { action: 'getUserId' },
                (response) => {
                  if (chrome.runtime.lastError) {
                    console.log(
                      'ERROR: ' + chrome.runtime.lastError.message
                    );
                  } else {
                    if (response) {
                      chrome.storage.local.set(
                        {
                          userId: response.userId,
                        },
                        () => {
                          chrome.runtime.sendMessage({
                            action: 'userIdStored',
                          }); // Respond to the popup after the userId is stored.
                        }
                      );
                      return true; // Keep the sendResponse function alive for the asynchronous operation.
                    }
                  }
                }
              );
            } else {
              console.log(
                'Tab is not fully loaded yet or does not exist'
              );
            }
          }
        );
      } catch (e) {
        console.error(e);
      }
    }

    return true;
  }
);
