'use strict';
let video, tmInterval, options = {
    minutes: 60
};


const hostKey = location.host;
const timingFrame = new TimeFrame();

browser.storage.onChanged.addListener(changeOptions);

browser.storage.sync.get("options").then((item) => {
    options = item.options || options;
});

//window.addEventListener("resize")


class MediaEventLogger {

    constructor(logStoreImpl) {
        this.store = logStoreImpl;
    }

    log(eventName) {
        const dt = new Date().toLocaleDateString('en');

        const record = {
            event: eventName,
            dt: dt,
            time: Date.now(),
            host: this.store.host,
            search: location.search
        };
        const ownerEl = document.querySelectorAll(".ytd-video-owner-renderer a");
        if (ownerEl.length) {
            record.channel = {
                owner: ownerEl[0].innerText
            };
        }

        this.store.push(record);

        console.log("record", record);
        //console.log("this.store.records", this.store.records);
    }

    logPlay() {
        this.log('start');
    }

    logStop() {
        this.log('stop');
    }

    getByHost() {
        return this.store.records;
    }
}

//const logger = new MediaEventLogger(new LogStoreInMemoryImpl(hostKey));
const logger = new MediaEventLogger(new LogStoreSyncImpl(hostKey, browser.storage.sync));
const timeController = new TimeController(hostKey, logger);

function changeOptions(changes, area) {
    const opts = changes["options"];
    if (!opts) return;
    if (opts.oldValue != opts.newValue) {
        options = opts.newValue;
    }
}

let alertBox ;

function onDOMContentLoaded() {
    video = document.querySelector('video');

    if (video) {
        console.log("Attaching video events!");
        alertBox = new AlertFrame(video);

        if (!video.paused)
            playStarted('');

        video.addEventListener('play', (event) => playStarted());
        video.addEventListener('ended', (event) => playStopped('ended'));
        video.addEventListener('pause', (event) => playStopped('pause'));

        startTimer();
    } else {
        console.error("video is null!", "trying to onDOMContentLoaded in 3 seconds");
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

function playStarted(txt = 'play') {
    logger.logPlay();
    checkTime('');
    startTimer();
}

function playStopped(txt) {
    logger.logStop();
    checkTime('');
    stopTimer();
}

function checkTime(txt) {
    const seconds = timeController.calculateSeconds();
    const totalMins = options.minutes;
    timingFrame.text = `${txt} ${secs2Mins(seconds)}/${totalMins}:00`;
    const secsLimit = totalMins * 60;
    if (seconds > secsLimit) {
        exitFullScreen();
        if (!video.paused) video.pause();
        alertBox.show(seconds);
    }
}

function exitFullScreen() {
    if (document.fullscreenElement) {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

const wndResize = debounce(() => {
        console.log("wndResize", new Date);
        alertBox.setPosition();
    }, 100);

function wndUnload() {
    console.log("wndUnload")
    window.removeEventListener("resize", wndResize);
}

window.addEventListener("resize", wndResize);
window.addEventListener("unload", wndUnload);
document.addEventListener("DOMContentLoaded", onDOMContentLoaded);

if (document.readyState != "loading")
    onDOMContentLoaded();