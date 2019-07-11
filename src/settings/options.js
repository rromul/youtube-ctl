function saveOptions(e) {
    e.preventDefault();
    browser.storage.sync.set({
        options: {
            minutes: parseInt(document.getElementById("minutes").value)
        }
    });
}

function onDOMContentLoaded() {

    function setCurrentOptions(storageItem) {
        const opts = storageItem.options;
        document.getElementById("minutes").value = opts.minutes || 60;
        document.getElementById("saveBtn").disabled = false;
    }

    function onError(error) {
        console.error(error);
    }

    browser.storage.sync.get("options").then(setCurrentOptions, onError);

    const hostKey = "www.youtube.com";
    const store = new LogStoreSyncImpl(hostKey, browser.storage.sync);
    const clearLogBtn = document.getElementById("clearLogBtn");
    store.getEvents(() => {
        clearLogBtn.disabled = !store.hasRecords;
    });
    clearLogBtn.onclick = () => {
        if (confirm("Очистить журнал?")) {
            store.clear();
        }
    }
}


if (document.readyState == "loading")
    document.addEventListener("DOMContentLoaded", onDOMContentLoaded);
else
    onDOMContentLoaded();

document.querySelector("form").addEventListener("submit", saveOptions);