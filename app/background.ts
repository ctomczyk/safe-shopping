const getCurrentTab = async (): Promise<chrome.tabs.Tab> => {
  const queryOptions: chrome.tabs.QueryInfo = {
    active: true,
    lastFocusedWindow: true
  };
  const [tab]: chrome.tabs.Tab[] = await chrome.tabs.query(queryOptions);

  return tab;
};

chrome.action.setPopup({
  popup: 'popup.html'
}).then(() => {
  console.log('ok');
});
