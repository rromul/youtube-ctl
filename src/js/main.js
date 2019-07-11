'use strict';
browser.storage.onChanged.addListener(changeOptions);




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
        console.log("this.store.records", this.store.records);
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


const hostKey = location.host;
const timingFrame = new TimeFrame();
//const logger = new MediaEventLogger(new LogStoreInMemoryImpl(hostKey));
const logger = new MediaEventLogger(new LogStoreSyncImpl(hostKey, browser.storage.sync));
const timeController = new TimeController(hostKey, logger);
let video, tmInterval, options = {
    minutes: 60
};

browser.storage.sync.get("options").then((item) => {
    options = item.options || options;
});



function changeOptions(changes, area) {
    if (changes["options"].oldValue != changes["options"].newValue){
        options = changes["options"].newValue;
    }
}

if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", onDOMContentLoaded);
else
    onDOMContentLoaded();

function onDOMContentLoaded() {
    video = document.querySelector('video');

    if (video) {
        console.log("Attaching video events!");

        if (!video.paused)
            playStarted('');

        video.addEventListener('play', (event) => playStarted());
        video.addEventListener('ended', (event) => playStopped('ended'));
        video.addEventListener('pause', (event) => playStopped('pause'));

        startTimer();
    } else {
        console.error("video is null!", "trying to onDOMContentLoaded in 3 seconds");
        setTimeout(onDOMContentLoaded, 3000);
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
    if (seconds > options.minutes * 60) {
        if (!video.paused) video.pause();
        showAlert(seconds);
    }
}

function secs2Mins(seconds, txt = "c.") {
    if (seconds < 59) {
        return pad0(seconds) + txt;
    } else {
        const mins = Math.floor(seconds / 60);
        return pad0(mins) + ":" + pad0(seconds - mins * 60);
    }

    function pad0(n) {
        return String(n).length == 1 ? `0${n}` : String(n);
    }
}

function showAlert(seconds) {
    let alertFrame = document.querySelector("#ytbctlAlertFrame");
    if (!alertFrame) {
        alertFrame = document.createElement("div");
        alertFrame.id = "ytbctlAlertFrame";
        alertFrame.className = "alertFrame";
        const msgFrame = document.createElement("div");
        alertFrame.insertAdjacentElement("afterBegin", msgFrame);
        msgFrame.innerText = "Сегодня время просмотра составило " + secs2Mins(seconds) + "!";

        const columns = document.querySelector("#columns");
        columns.insertAdjacentElement("afterBegin", alertFrame);
    } else {
        alertFrame.style.display = "";
    }
}