// Favicon API base
var faviconBase = "https://www.google.com/s2/favicons?domain="; // Google is a wonderful company!

// Current vault
var vault = null;

// Show page based on `current-state` local storage variable
function stateUpdated(state) {
    if (state !== "logged-in") {
        document.location.href = "/manager/please-login.html";
    }
}

// Update the page based on a vault update
function vaultUpdated() {
    if (!vault) {
        return;
    }

    $("#password-display").empty();
    console.log("Display:", $("#password-display"));
    var $template = $("#password-display-sample");

    for (var site in vault.passwords) {
        (function(site, passwords) {
            // Get favicon
            var protoEnd = site.indexOf("://");
            protoEnd = protoEnd === -1 ? 0 : protoEnd + 3;
            var domainEnd = site.indexOf("/", protoEnd);
            domainEnd = domainEnd === -1 ? site.length : domainEnd;
            var favicon = faviconBase + encodeURIComponent(site.substring(protoEnd, domainEnd));

            // Create element
            var $elm = $template.clone();
            $elm.attr("id", null);
            $elm.show();
            $("#password-display").append($elm);

            // Give values
            $elm.find(".card-title").text(site);
            $elm.find("img").attr("src", favicon);

            // Animate element
            $elm.click(function() {
                var $rowTemplate = $("#password-list-sample");
                $("#password-list-body").empty();

                // Show overlay
                $("#overlay-wrapper").show();
                $("#overlay-site-name").text(site);

                // Fill in entries
                for (var i = 0; i < passwords.length; i++) {
                    (function(password) {
                        var passwordVisible = false;

                        // Create element
                        console.log("Doing the do for", password);
                        var $row = $rowTemplate.clone();
                        $row.attr("id", null);
                        $row.show();
                        $("#password-list-body").append($row);

                        // Update fields
                        $row.find(".list-username").text(password.username || "");
                        $row.find(".list-notes").text(password.notes || "");
                        $row.find(".list-updated").text(new Date(password.updated).toLocaleString());

                        // Show password button
                        $row.find(".list-toggle").click(function() {
                            passwordVisible = !passwordVisible;
                            $row.find(".list-toggle").children(".material-icons").html(
                                passwordVisible ? "visibility_off" : "visibility_on"
                            );

                            if (passwordVisible) {
                                $row.find(".list-spoiler").hide();
                                $row.find(".list-plain-password").show();
                                $row.find(".list-plain-password").text(password.password);
                            } else {
                                $row.find(".list-spoiler").show();
                                $row.find(".list-plain-password").hide();
                                $row.find(".list-plain-password").html("");
                            }
                        });

                        // Copy button
                        $row.find(".list-copy").click(function() {
                            alert("TODO: Copy button");
                        });

                        // Generate button
                        $row.find(".list-generate").click(function() {
                            alert("TODO: Generate button"); // Show dialog
                        });

                        // Edit button
                        $row.find(".list-edit").click(function() {
                            alert("TODO: Edit button");
                        })
                    })(passwords[i]);
                }

                // Tooltip it up!
                $("#password-list").find(".tooltipped").tooltip();
            });
        })(site, vault.passwords[site]);
    }

    console.log("Vault was updated! Now:", vault); // TODO: Remove; testing
}

// Setup document
$(document).ready(function() {
    // Hide overlay
    $("#overlay-background,#overlay-close").click(function() {
        $("#overlay-wrapper").hide();
    });

    // Initiate tooltips
    $(".tooltipped").tooltip();

    // Get vault
    browser.runtime.sendMessage({
        "name": "get-vault"
    }).then(function(the_vault) {
        vault = the_vault;
        vaultUpdated();
    }).catch(function(err) {
        // TODO: Tell user
    });
});

// Listen for storage changes
// TODO: Re-enable once you figure this out
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
