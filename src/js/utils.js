class AlertFrame {
    constructor(video = null, selector = "#ytbctlAlertFrame") {
        this.alertFrame = document.querySelector(selector);
        this.video = video;
    }
    show(seconds) {
        let msgFrame;
        if (!this.alertFrame) {
            this.alertFrame = document.createElement("div");
            this.alertFrame.id = "ytbctlAlertFrame";
            this.alertFrame.className = "alertFrame";
            const titleDiv = document.createElement("div");
            titleDiv.innerText = "Youtube time controller";
            titleDiv.className = "yc-title";
            this.alertFrame.appendChild(titleDiv);

            msgFrame = document.createElement("div");
            msgFrame.className = "yc-msg-frame";
            this.alertFrame.appendChild(msgFrame);

            const columns = document.querySelector("#columns");
            columns.insertAdjacentElement("afterBegin", this.alertFrame);
        } else {
            this.alertFrame.style.display = "";
            msgFrame = this.alertFrame.querySelector("div.yc-msg-frame");
        }
        const sTime = secs2Mins(seconds);
        const warn = `Сегодня время просмотра составило ${sTime}!`;
        msgFrame.innerText = warn;
        this.setPosition(this.alertFrame, this.video);
        this.generateSound([0.8, 0.5]);
        this.createNotification(sTime);
    }

    setPosition() {
        const elem = this.alertFrame,
            v = this.video;
        setTimeout(() => {
            const rect = v.getBoundingClientRect();
            if (elem) {
                elem.style.top = (parseInt(rect.top)+1) + "px";
                elem.style.left = (Math.round(rect.left)+1) + "px";
                elem.style.width = (parseInt(rect.width)-2) + "px";
                elem.style.height = (parseInt(rect.height)-2) + "px";
            }
        }, 100);
    }

    generateSound([period, volume]) {
        let audioCtx = new(window.AudioContext || new webkitAudioContext);
        let osc = audioCtx.createOscillator();
        let vol = audioCtx.createGain();
        osc.type = 'square';
        vol.gain.value = volume; // from 0 to 1, 1 full volume, 0 is muted
        osc.connect(vol); // connect osc to vol
        osc.frequency.setValueAtTime(3000, audioCtx.currentTime);
        vol.connect(audioCtx.destination); // connect vol to context destination
        osc.start(0);
        setTimeout(() => osc.disconnect(), period);
    }

    createNotification() {
        try {
            if (browser.notifications) {
                browser.notifications.create("youtube-time-ctl", {
                    "type": "basic",
                    "iconUrl": browser.runtime.getURL("icons/ico-48.png"),
                    "title": "Youtube time controller!",
                    "message": "На сегодня время просмотра Youtube вышло!",
                    "priority": 2
                });
            }
        } catch (e) {
            console.log(e);
        }
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


function debounce(f, ms) {

    let timer = null;

    return function (...args) {
        const onComplete = () => {
            f.apply(this, args);
            timer = null;
        }

        if (timer) {
            clearTimeout(timer);
        }

        timer = setTimeout(onComplete, ms);
    };
}