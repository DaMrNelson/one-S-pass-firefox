// React when valid password result is received
browser.runtime.onMessage.addListener(function(msg) {
    if (msg["subject"] == "password-valid") {
        // TODO: Password was valid. Show "loading vault..."
    }
});

// Show page based on `current-state` local storage variable
function stateUpdated(state) {
    var $loginForm = $("#login-form");
    var $loadingScreen = $("#loading-screen");

    if (state === "logged-out" || !state || typeof(state) !== "string") {
        $loginForm.show();
        $loadingScreen.hide();
    } else if (state === "logged-in") {
        document.location.href = "/popup/home.html";
    } else {
        $loginForm.show();
        $loadingScreen.css({
            "width": $loginForm.width() + "px",
            "height": $loginForm.height() + "px"
        });
        $loginForm.hide();
        $loadingScreen.show();

        // Set text
        // TODO: Show a fun fact or something as the description?
        if (state === "hashing-password") {
            $("#loading-desc").text("Securing Password");
        } else if (state === "logging-in") {
            $("#loading-desc").text("Logging In");
        } else if (state === "decrypting-vault") {
            $("#loading-desc").text("Decrypting Vault");
        }
    }
}

// Setup document
$(document).ready(function() {
    // Form submissions
    $("#login").click(function() {
        var $form = $(this);

        // Verify login
        var email = $("#login-email").val();
        var password = $("#login-password").val();

        // Try to login
        browser.runtime.sendMessage({
            "name": "login",
            "email": email,
            "password": password
        });
    });

    // Open signup page
    $("#sign-up").click(function() {
        browser.tabs.create({
            url: "https://onedollarpass.net/sign-up"
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
});
