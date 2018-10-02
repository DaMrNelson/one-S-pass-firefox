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
                        var $row = $rowTemplate.clone();
                        $row.attr("id", null);
                        $row.show();
                        $("#password-list-body").append($row);

                        // Store some frequently used elements for later
                        var $listUsername = $row.find(".list-username");
                        var $listPassword = $row.find(".list-password");
                        var $listNotes = $row.find(".list-notes");
                        var $listSaveBtn = $row.find(".list-save");

                        // Check if any fields have changed
                        var hasChanged = function() {
                            return $listUsername.val() !== (password.username || "")
                                    || $listPassword.val() !== (password.password || "")
                                    || $listNotes.val() !== (password.notes || "");
                        }

                        // Update fields
                        $listUsername.val(password.username || "");
                        $listPassword.val(password.password || "");
                        $listNotes.val(password.notes || "");
                        $row.find(".list-updated").text(new Date(password.updated).toLocaleString());

                        // Update "save" button on field edit
                        $row.find(".list-username,.list-password,.list-notes").on("input change paste keyup keydown", function() {
                            if (hasChanged()) {
                                if (!$listSaveBtn.hasClass("changes")) {
                                    $listSaveBtn.removeClass("no-changes");
                                    $listSaveBtn.addClass("changes");
                                }
                            } else {
                                if (!$listSaveBtn.hasClass("no-changes")) {
                                    $listSaveBtn.removeClass("changes");
                                    $listSaveBtn.addClass("no-changes");
                                }
                            }
                        });

                        // Save on enter press
                        $row.find(".list-username,.list-password,.list-notes").on("keydown", function($e) {
                            if ($e.which == 13 || $e.keyCode == 13 || $e.key === "Enter") { // 2 depreciated, 1 not fully supported. Web dev is awesome!
                                $listSaveBtn.find(".material-icons").click();
                            }
                        });

                        // Show password button
                        $row.find(".list-toggle").click(function() {
                            passwordVisible = !passwordVisible;
                            $row.find(".list-toggle").children(".material-icons").html(
                                passwordVisible ? "visibility_off" : "visibility_on"
                            );

                            if (passwordVisible) {
                                $listPassword.attr("type", "text");
                                $row.find(".list-copy").removeClass("uncopyable").addClass("copyable");
                            } else {
                                $listPassword.attr("type", "password");
                                $row.find(".list-copy").removeClass("copyable").addClass("uncopyable")
                            }
                        });

                        // Password copy button
                        $row.find(".list-copy").click(function() {
                            if ($listPassword.attr("type") === "password") {
                                // TODO: Give a prompt telling the user they must make their password viewable first
                                return;
                            }

                            $listPassword.select();
                            document.execCommand("copy");

                            // TODO: Show an overlay that reminds the user to clear their clipboard
                        });

                        // Password generate button
                        $row.find(".list-generate").click(function() {
                            alert("TODO: Generate button"); // Show dialog
                        });

                        // Save button
                        $listSaveBtn.find(".material-icons").click(function() {
                            if (hasChanged()) {
                                // Update list
                                password.username = $listUsername.val();
                                password.password = $listPassword.val();
                                password.notes = $listNotes.val();
                                password.updated = new Date().getTime();

                                // Update graphic
                                if (!$listSaveBtn.hasClass("no-changes")) {
                                    $listSaveBtn.removeClass("changes");
                                    $listSaveBtn.addClass("no-changes");
                                }

                                // Send to communicator
                                browser.runtime.sendMessage({
                                    "name": "set-passwords",
                                    "site": site,
                                    "passwords": passwords
                                });
                            }
                        });

                        // Delete button
                        $row.find(".list-delete > .material-icons").click(function() {
                            // TODO: Better prompt
                            // Make sure it has a "don't ask me again"
                            if (confirm("Are you sure you would like to delete this password?\n\nYou will only be able to get it back if you have stored it in a backup.")) {
                                // Remove from list
                                for (var i = 0; i < passwords.length; i++) {
                                    if (passwords[i] === password) { // Compares by reference, not values
                                        passwords.splice(i, 1);
                                        break;
                                    }
                                }

                                // Update graphic
                                $row.remove();

                                // Send to communicator
                                browser.runtime.sendMessage({
                                    "name": "set-passwords",
                                    "site": site,
                                    "passwords": passwords
                                });
                            }
                        });
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
    } else if (changes["last-vault-update"]) {
        // Get new vault
        browser.runtime.sendMessage({
            "name": "get-vault"
        }).then(function(the_vault) {
            vault = the_vault;
            vaultUpdated();
        }).catch(function(err) {
            // TODO: Tell user
        });
    }
});

// Initial state update, in case this gets loaded halfway through a login
browser.storage.local.get("current-state").then(function(result) {
    stateUpdated(result["current-state"]);
}).catch(function(err) {
    stateUpdated(null);
});
