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


const delayInMinutes = 1;
const periodInMinutes = 1;

// browser.alarms.create("youtube-ctl-check", {
//     delayInMinutes,
//     periodInMinutes
// });

// browser.alarms.onAlarm.addListener(function (info) {
//     console.log("on alarm: " + info.name);
// });

browser.tabs.onActivated.addListener(function(tabInfo){
    
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
    var gettingActiveTab = browser.tabs.query({
        active: true,
        currentWindow: true
    }).then((tabs) => {
        if (tabId == tabs[0].id) {
            
        }
    });
});