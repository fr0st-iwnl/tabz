function moveTabsToNewWindow(tabIds) {
    if (tabIds.length === 0) return;
    chrome.windows.create({ tabId: tabIds[0] }, (newWindow) => {
        if (tabIds.length > 1) {
            chrome.tabs.move(tabIds.slice(1), { windowId: newWindow.id, index: -1 });
        }
    });
}

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "split-selected-tabs",
        title: "Open selected tabs in a new window",
        contexts: ["tab"]
    });
});

function updateContextMenu() {
    chrome.tabs.query({ currentWindow: true, highlighted: true }, (tabs) => {
        const numTabs = tabs.length;
        const newTitle = `Open selected tabs in a new window (${numTabs})`;
        chrome.contextMenus.update("split-selected-tabs", { title: newTitle });
    });
}

chrome.tabs.onHighlighted.addListener(updateContextMenu);
chrome.tabs.onActivated.addListener(updateContextMenu);
chrome.tabs.onRemoved.addListener(updateContextMenu);
chrome.tabs.onUpdated.addListener(updateContextMenu);

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "split-selected-tabs") {
        chrome.tabs.query({ currentWindow: true, highlighted: true }, (highlightedTabs) => {
            const tabIds = highlightedTabs.map(t => t.id);
            tabIds.push(tab.id);
            const activeTabId = tab.id;

            const finalTabIds = tabIds.filter(id => id !== activeTabId || (id === tab.id));
            moveTabsToNewWindow(finalTabIds);
        });
    }
});

chrome.commands.onCommand.addListener((command) => {
    if (command === "split-tabs") {
        chrome.tabs.query({ currentWindow: true, highlighted: true }, (highlightedTabs) => {
            const tabIds = highlightedTabs.map(t => t.id);
            moveTabsToNewWindow(tabIds);
        });
    } else if (command === "open-popup") {
        chrome.browserAction.openPopup();
    } else if (command === "quick-split") {
        chrome.tabs.query({ currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                const lastTabs = tabs.slice(-3).map(t => t.id);
                console.log("Last tabs to open:", lastTabs);
                moveTabsToNewWindow(lastTabs);
            } else {
                console.error("No tabs found in the current window.");
            }
        });
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.command === "splitTabs" && message.tabIds) {
        moveTabsToNewWindow(message.tabIds);
    }
});

updateContextMenu();
