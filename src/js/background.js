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

// browser.browserAction.onClicked.addListener(() => {
//     var clearing = browser.notifications.clear("youtube-time-ctl");
//     clearing.then(() => {
//         console.log("cleared");
//     });
// });

browser.tabs.onActivated.addListener(function (tabInfo) {
    browser.tabs.get(tabInfo.tabId).then((tab) => {
        //console.log("on activated: " + tab.url);
        //Start logging if url == youtube.com
        try {
            browser.tabs.sendMessage(tabInfo.tabId, {
                msg: "tab-activated",
                url: tab.url
            });
        } catch (e) {}
    });
});


browser.runtime.onMessage.addListener(function (message, request, response) {
    if (message.badgeText)
        setBadge(message.badgeText);
    if (message.browserActionTitle)
        setTitle(message.browserActionTitle);
});


function setTitle(title) {
    browser.browserAction.setTitle({
        title: title
    });
}

function setBadge(text) {
    browser.browserAction.setBadgeText({
        text
    });
}