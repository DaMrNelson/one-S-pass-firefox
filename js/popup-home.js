// Show page based on `current-state` local storage variable
function stateUpdated(state) {
    if (state !== "logged-in") {
        document.location.href = "/popup/login.html";
    }
}

// Setup document
$(document).ready(function() {
    // Manage button
    $("#open-manager").click(function() {
        browser.tabs.create({
            "url": "/manager/home.html",
            "active": true
        });
        window.close();
    });

    // Log out button
    $("#logout").click(function() {
        browser.runtime.sendMessage({
            "name": "logout"
        });
    });
});

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
