// Show page based on `current-state` local storage variable
function stateUpdated(state) {
    if (state !== "logged-in") {
        document.location.href = "/popup/login.html";
    }
}

// Monitors the given tab for page changes, and updated passwords accordingly
var lastTabUpdateListener = null;
function monitorTab(tab) {
    displayPasswords(tab.url);

    // Remove old listener
    if (lastTabUpdateListener) {
        browser.tabs.onUpdated.removeListener(lastTabUpdateListener);
        lastTabUpdateListener = null;
    }

    // Add new one
    var lastUrl = tab.url;
    browser.tabs.onUpdated.addListener(
        function(tabId, changeInfo, tab) {
            if (tab.url !== lastUrl) {
                lastUrl = tab.url;
                displayPasswords(tab.url);
            }
        },
        {
            "tabId": tab.tabId
        }
    );
}

// Gets and displays passwords for the given site
var lastDisplayPassword = 0; // debounce
function displayPasswords(url) {
    if (!url) {
        $("#password-list").empty().hide();
        return;
    }

    // Debounce init
    var myId = new Date().getTime();
    lastDisplayPassword = myId;

    // Clear list of passwords
    $("#password-list").empty().hide();

    // Get passwords
    browser.runtime.sendMessage({
        "name": "get-passwords",
        "site": url
    }).then(function(passwords) {
        // Debounce
        if (lastDisplayPassword !== myId) {
            return;
        }

        // Update graphic
        var $template = $("#sample-password");
        if (passwords.length === 0) {
            $("#password-list").empty().hide();
        } else {
            $("#password-list").empty().show();

            for (var i = 0; i < passwords.length; i++) {
                (function(password) {
                    // Clone
                    var $entry = $template.clone();
                    $entry.attr("id", null);
                    $entry.show();
                    $("#password-list").append($entry);

                    // Fill in attributes
                    if (password.username) {
                        $entry.find(".username").text(password.username)
                    } else {
                        $entry.find(".username").html("<i>No Username</i>");
                    }

                    if (password.notes) {
                        $entry.find(".notes").text(password.notes);
                    } else {
                        $entry.find(".notes").remove();
                    }

                    // Animate
                    $entry.find(".tooltipped").tooltip();

                    $entry.find(".insert").click(function() {
                        alert("TODO: Insert button");
                    });

                    $entry.find(".copy").click(function() {
                        alert("TODO: Copy button");
                    });

                    $entry.find(".edit").click(function() {
                        alert("TODO: Manager button");
                    });
                    // TODO: Buttons
                })(passwords[i]);
            }
        }
    }).catch(function(err) {
        // TODO: Display error to user
    });
}

// Setup document
$(document).ready(function() {
    // Initialize some stuff
    $(".tooltipped").tooltip();

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

    // Get passwords for current tab
    browser.tabs.query({"active": true, "currentWindow": true}).then(function(tabs) {
        monitorTab(tabs[0]); // Should only ever be one
    }).catch(function(err) {
        // TODO: Display error to user?
    });

    // Get passwords for any other tabs that are swapped to
    browser.tabs.onActivated.addListener(function(activeInfo) {
        browser.tabs.get(activeInfo.tabId).then(function(tab) {
            monitorTab(tab);
        }).catch(function(err) {
            // TODO: Display error to user?
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
