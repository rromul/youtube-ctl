browser.runtime.onInstalled.addListener(async ({
    reason,
    temporary,
}) => {
    if (temporary) return; // skip during development
    switch (reason) {
        case "install": {
            const url = browser.runtime.getURL("views/installed.html");
            await browser.tabs.create({
                url,
            });
            // or: await browser.windows.create({ url, type: "popup", height: 600, width: 600, });
        }
        break;
        // see below
    }
});

browser.browserAction.onClicked.addListener(() => {
    var clearing = browser.notifications.clear("youtube-time-ctl");
    clearing.then(() => {
        console.log("cleared");
    });
});

browser.tabs.onActivated.addListener(function (tabInfo) {

    browser.tabs.get(tabInfo.tabId).then((tab) => {
        console.log("on activated: " + tab.url);
        //Start logging if url == youtube.com
    });
});

/*
    Do something in the currently active tab, whenever the user navigates.
*/
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (!changeInfo.url) {
        return;
    }
    browser.tabs.query({
        active: true,
        currentWindow: true
    }).then((tabs) => {
        if (tabId == tabs[0].id) {

        }
    });
});

browser.runtime.onMessage.addListener(function (message, request, response) {
    if (message.badgeText)
        setBadge(message.badgeText);
    if (message.browserActionTitle)
        browser.browserAction.setTitle({
            title: browserActionTitle
        });
});



function setBadge(text) {

    browser.browserAction.setBadgeText({
        text
    });
}