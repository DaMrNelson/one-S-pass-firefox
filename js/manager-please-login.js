// Show page based on `current-state` local storage variable
function stateUpdated(state) {
    if (state === "logged-in") {
        document.location.href = "/manager/home.html";
    }
}

// Listen for storage changes
browser.storage.onChanged.addListener(function(changes, areaName) {
    if (areaName !== "local") {
        return;
    }

    if (changes["current-state"]) {
        stateUpdated(changes["current-state"].newValue);
    }
});

// Initial state update, in case this gets loaded halfway through a login
browser.storage.local.get("current-state").then(function(result) {
    stateUpdated(result["current-state"]);
}).catch(function(err) {
    stateUpdated(null);
});
