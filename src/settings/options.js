function saveOptions(e) {
    e.preventDefault();
    browser.storage.sync.set({
        options: {
            minutes: parseInt(document.getElementById("minutes").value)
        }
    });
}

function restoreOptions() {

    function setCurrentChoice(result) {
        document.getElementById("minutes").value = result.minutes || 60;
    }

    function onError(error) {
        console.log(`Error: ${error}`);
    }

    browser.storage.sync.get("options").then(setCurrentChoice, onError);
}


if (document.readyState == "loading")
    document.addEventListener("DOMContentLoaded", restoreOptions);
else
    restoreOptions();

document.querySelector("form").addEventListener("submit", saveOptions);