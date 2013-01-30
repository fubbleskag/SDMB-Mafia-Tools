// Show the page action icon on specific URLs

	chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
		if (tab.url.indexOf('boards.straightdope.com/sdmb/showthread.php') > -1) {
			chrome.pageAction.show(tabId);
		}
	});

// Send a message when the page action icon is clicked

	chrome.pageAction.onClicked.addListener(function(tab){
		chrome.tabs.sendMessage(tab.id, { greeting: "toggleToolbar" });
	});