'use strict';

const hostKey = location.host;
let video, tmInterval, options = {
    minutes: 60
};
let timingFrame, logger, timeController;

browser.storage.onChanged.addListener(onChangeOptions);
browser.runtime.onMessage.addListener(onMessage);

browser.storage.sync.get("options").then((item) => {
    options = item.options || options;
});

const onWndResize = debounce(() => {
    getAlert().setPosition();
}, 200);

window.addEventListener("resize", onWndResize);
window.addEventListener("unload", onWndUnload);
document.addEventListener("DOMContentLoaded", onDOMContentLoaded, {
    once: true
});

function onMessage(message, request, response)
 {
     if (message.msg == 'tab-activated') {
         if (message.url == location.href) {
             //console.log(message, location.href)
             if (!video.paused)
                 checkTime("");
         }
     }
 }
function onChangeOptions(changes, area) {
    const opts = changes["options"];
    if (!opts) return;
    if (opts.oldValue != opts.newValue) {
        options = opts.newValue;
    }
}

function getAlert() {
    return new AlertFrame(video, options);
}

function onDOMContentLoaded() {
    video = document.querySelector('video');

    timingFrame = new TimeFrame();
    logger = new MediaEventLogger(new LogStoreSyncImpl(hostKey, browser.storage.sync), "");
    timeController = new TimeController(hostKey, logger);

    if (video) {
        //console.log("Attaching video events!");

        if (!video.paused)
            onPlayStarted('');

        video.addEventListener('play', (event) => onPlayStarted());
        video.addEventListener('ended', (event) => onPlayStopped('ended'));
        video.addEventListener('pause', (event) => onPlayStopped('pause'));

        startTimer();
    } else {
        console.warn("video is null!", "trying to onDOMContentLoaded in 3 seconds");
        setTimeout(onDOMContentLoaded, 2000);
    }
}

function startTimer() {
    if (!tmInterval)
        tmInterval = setInterval(() => checkTime(""), 1000);
}

function stopTimer() {
    if (tmInterval) {
        clearInterval(tmInterval);
        tmInterval = null;
    }
}

function onPlayStarted(txt = 'play') {
    logger.logPlay();
    checkTime('');
    startTimer();
}

function onPlayStopped(txt) {
    logger.logStop();
    checkTime('');
    stopTimer();
}

function checkTime(txt) {
    const seconds = timeController.calculateSeconds();
    const totalMins = options.minutes;
    const time = `${txt} ${secs2Mins(seconds)}/${secs2Mins(totalMins*60)}`;
    timingFrame.text = time;
    browser.runtime.sendMessage({
        badgeText: secs2Mins(seconds),
        browserActionTitle: "Youtube time controller: " + time
    });
    const secsLimit = totalMins * 60;
    if (seconds > secsLimit) {
        exitFullScreen();
        if (!video.paused) video.pause();
        getAlert().show(seconds);
    }
}

function exitFullScreen() {
    if (document.fullscreenElement) {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

function onWndUnload() {
    //    console.log("wndUnload")
    window.removeEventListener("resize", onWndResize);
}

if (document.readyState != "loading")
    onDOMContentLoaded();