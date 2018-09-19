// React when valid password result is received
browser.runtime.onMessage.addListener(function(msg) {
    if (msg["subject"] == "password-valid") {
        // TODO: Password was valid. Show "loading vault..."
    }
});

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
        /*verifyCredentials().then(function(content) {
            browser.storage.local.set({
                "email": $("#login-email").val(),
                "logged-in": true,
                "has-signed-up": true
            });
            alert("Good");
            // TODO: This
        }).catch(function(content) {
            alert("Bad");
            // TODO: This
        });*/
    });

    // Open signup page
    $("#sign-up").click(function() {
        browser.tabs.create({
            url: "https://onedollarpass.net/sign-up"
        });
    });
});
