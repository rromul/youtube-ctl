'use strict';

class TimingFrame {
    constructor(id = "timingFrame", contId = "container") {
        this.frameId = id;
        this.containerId = contId;
        this.message = "";
    }

    get frame() {
        let frame = document.querySelector('#' + this.frameId);
        if (!frame) {
            frame = document.createElement("div");
            frame.id = this.frameId;
            frame.style = "border: 1px solid red; border-radius: 10px 100px / 100px; color: green; padding: 2px";
            let cont = document.querySelector('#' + this.containerId);
            cont.insertAdjacentElement("afterbegin", frame);
        }
        return frame;
    }

    set text(text) {
        this.message = text;
        this.frame.innerText = text;
    }

    get text() {
        return this.message;
    }
}

class LogStoreInMemoryImpl {
    constructor(host) {
        this.host = host;
        this.hostEvents = {};
        this.hostEvents[host] = [];
    }

    push(record) {
        const list = this.hostEvents[this.host];
        list.push(record);
    }
    get records() {
        return this.hostEvents[this.host];
    }
}

class LogStoreSyncImpl {
    constructor(host, storage) {
        this.host = host;
        this.hostEvents = {};
        this.hostEvents[host] = [];
        this.storage = storage;
    }

    push(record) {
        const me = this,
            stor = this.storage;
        stor.get("events").then(item => {
            const events = item.events || {};
            const arrEvents = events[me.host] || [];
            arrEvents.push(record);
            events[me.host] = arrEvents;

            stor.set({
                events
            }).then(() => {
                //refresh
                me.hostEvents = events;
            });
        });
    }

    get records() {
        return this.hostEvents[this.host];
    }

    clear(date) {
        const me = this,
            stor = this.storage,
            dt = date ? date.toLocaleDateString("en") : null;
        stor.get("events").then(item => {
            if (item.events) {
                const arrEvents = (item.events[me.host] || []).filter(r => dt && r.dt != dt);
                stor.set({
                    events: arrEvents
                }).then(() => {
                    //refresh
                    me.hostEvents = [];
                });
            }
        });
    }
}

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
const timingFrame = new TimingFrame();
//const logger = new MediaEventLogger(new LogStoreInMemoryImpl(hostKey));
const logger = new MediaEventLogger(new LogStoreSyncImpl(hostKey, browser.storage.sync));
const timeController = new TimeController(hostKey, logger);
let video, tm, options = { minutes: 60 };

browser.storage.sync.get("options").then((item) => {
    options = item.options || options;
});

if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", onDOMContentLoaded);
else
    setTimeout(onDOMContentLoaded, 10000);

function onDOMContentLoaded() {
    video = document.querySelector('video');

    if (video) {
        console.log("Attaching video events!");

        if (!video.paused) {
            playStarted('playback is started');
        }

        video.addEventListener('play', (event) => playStarted());
        video.addEventListener('ended', (event) => playStopped('ended'));
        video.addEventListener('pause', (event) => playStopped('pause'));

        // video.addEventListener('playing', (event) => {
        //     logger.log('playing');
        // });

        startTimer();
    } else {
        console.error("video is null!");
    }
}

function startTimer() {
    tm = setInterval(() => drawTiming("tick"), 2000);
}

function playStarted(txt = 'play') {
    logger.logPlay();
    drawTiming(txt);
}

function playStopped(txt) {
    logger.logStop();
    drawTiming(txt);
    if (tm) {
        clearInterval(tm);
        tm = null;
    }
}

function drawTiming(txt) {
    const seconds = timeController.calculateSeconds();
    timingFrame.text = txt + " " + seconds + " sec";
    if (seconds > options.minutes * 60) {
        if (!video.paused) video.pause();
        showAlert(seconds);
    }
}

function showAlert(seconds) {
    let alertFrame = document.querySelector("#ytbctlAlertFrame");
    if (!alertFrame) {
        alertFrame = document.createElement("div");
        alertFrame.id = "ytbctlAlertFrame";
        alertFrame.style = "border: 1px solid red; position: fixed; top: 200px; left: 200px; background: blue; color: white; font-size: 3em; width: 400px; height: 250px; z-index: 1000;";
        const msgFrame = document.createElement("div");
        alertFrame.insertAdjacentElement("afterBegin", msgFrame);
        msgFrame.innerText = "Сегодня время просмотра составило " + Math.round(seconds) + " секунд!";
        const btn = document.createElement("button");
        btn.textContent = "Очистить лог";
        btn.onclick = (e) => {
            logger.store.clear();
            alertFrame.style.display = "none";
        };
        alertFrame.insertAdjacentElement("beforeEnd", btn);
        const columns = document.querySelector("#columns");
        columns.insertAdjacentElement("afterBegin", alertFrame);
    } else {
        alertFrame.style.display = "";
    }
}