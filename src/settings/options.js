const
    clearLogBtn = document.getElementById("clearLogBtn"),
    hostKey = "www.youtube.com",
    browserStorage = browser.storage.sync,
    store = new LogStoreSyncImpl(hostKey, browserStorage);

browser.storage.onChanged.addListener(changeOptions);

function changeOptions(){
    clearLogBtn.disabled = !store.hasRecords;
}

function getOptions() {
    return browserStorage.get("options");
}

function setOptions(options){
    return browserStorage.set({
        options
    });
}

function onDOMContentLoaded() {
    const
        saveBtn = document.getElementById("saveBtn"),
        form = document.getElementById("optionsForm"),
        minutesTb = document.getElementById("minutes");

    function saveOptions(e) {
        e.preventDefault();
        let minutes = parseInt(minutesTb.value);
        setOptions({ minutes }).then(() => {
            saveBtn.disabled = true;
        });
    }

    function initOptionsForm(storageItem) {
        const opts = storageItem.options;
        if (opts) {
            minutesTb.value = opts.minutes || 60;
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
    saveBtn.onclick = saveOptions;

}


if (document.readyState == "loading")
    document.addEventListener("DOMContentLoaded", onDOMContentLoaded);
else
    onDOMContentLoaded();