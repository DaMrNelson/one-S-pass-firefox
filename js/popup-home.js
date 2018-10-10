// Show page based on `current-state` local storage variable
function stateUpdated(state) {
    if (state !== "logged-in") {
        document.location.href = "/popup/login.html";
    }
}

// Gets and displays passwords for the given site
function displayPasswords(passwords) {
    // Update graphic
    var $template = $("#sample-password");

    if (passwords.length === 0) {
        $("#password-list").empty().hide();
        $(".material-tooltip").remove();
    } else {
        $("#password-list").empty().show();
        $(".material-tooltip").remove();

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

    $(".tooltipped").tooltip();
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

    // Get password list for current tab
    browser.runtime.sendMessage({
        "name": "get-passwords"
    }).then(function(passwords) {
        displayPasswords(passwords);
    }).catch(function(err) {
        // TODO: Tell user. Communicator should always be running and listening.
    });

    // Listen for password updates
    browser.runtime.onMessage.addListener(function(msg, sender, senderResponse) {
        if (msg.name === "update-passwords") {
            displayPasswords(msg.passwords);
        }
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
