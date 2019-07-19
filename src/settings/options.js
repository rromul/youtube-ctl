const
    byId = function (id) {
        return document.getElementById(id)
    },
    clearLogBtn = byId("clearLogBtn"),
    hostKey = "www.youtube.com",
    browserStorage = browser.storage.sync,
    store = new LogStoreSyncImpl(hostKey, browserStorage);

browser.storage.onChanged.addListener(changeOptions);

function changeOptions() {
    clearLogBtn.disabled = !store.hasRecords;
}

function getOptions() {
    return browserStorage.get("options");
}

function setOptions(options) {
    return browserStorage.set({
        options
    });
}

function onDOMContentLoaded() {

    const
        saveBtn = byId("saveBtn"),
        form = byId("optionsForm"),
        minutesTb = byId("minutes"),
        alertMsgTb = byId("alertMsgTb"),
        alertSndCb = byId("alertSoundCB");

    async function saveOptions(e) {
        e.preventDefault();
        let minutes = parseInt(minutesTb.value);
        //console.log(alertSndCb.checked)
        // setOptions({
        //     minutes,
        //     alert: {
        //         msg: alertMsgTb.value,
        //         sound: alertSndCb.checked
        //     }
        // }).
        // then(() => {
        //     saveBtn.disabled = true;
        // });
        try {
            await setOptions({
                minutes,
                alert: {
                    msg: alertMsgTb.value,
                    sound: alertSndCb.checked
                }
            });
            saveBtn.disabled = true;
        } catch (e) {
            console.error(e);
        }
    }

    function initOptionsForm(storageItem) {
        const opts = storageItem.options;
        if (opts) {
            minutesTb.value = opts.minutes || 60;
            alertMsgTb.value = opts.alert ? opts.alert.msg || "" : "";
            alertSndCb.checked = !opts.alert || opts.alert.sound === undefined || opts.alert.sound;
        }
    }

    function onError(error) {
        console.error(error);
    }

    getOptions().then(initOptionsForm, onError);

    store.getEvents().then(() => {
        clearLogBtn.disabled = !store.hasRecords;
    });
    clearLogBtn.onclick = () => {
        if (confirm("Очистить журнал?")) {
            store.clear();
        }
    }

    form.onchange = () => {
        saveBtn.disabled = false;
    };
    saveBtn.addEventListener("click", evt => saveOptions(evt));

}


if (document.readyState == "loading")
    document.addEventListener("DOMContentLoaded", onDOMContentLoaded);
else
    onDOMContentLoaded();