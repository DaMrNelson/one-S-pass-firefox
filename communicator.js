//var remote = "https://api.nschramm.com:14137";
var REMOTE = "http://127.0.0.1:14137";
var SALT = "OYVUXv&b";
var LATEST_VAULT_VERSION = 0;

// Current login info
var email = null;
var passwordPrivateHash = null;
var passwordPublicHash = null;

// Vault (store in memory ofc)
var vault = null;
var original_vault = null;

// Current URL
var currentUrl = null;

// Set logged out state
browser.storage.local.set({
    "current-state": "logged-out"
});

// Verifies that the current credentials are correct
// Returns a promise that passes the content (responseText).
// GET /verify-credentials
function verifyCredentials() {
    return new Promise(function(accept, reject) {
        /*
        var req = new XMLHttpRequest();
        req.onload = function() {
            if (this.status === 200) {
                accept(this.responseText);
            } else {
                reject(this.responseText);
            }
        };
        req.onerror = function() {
            reject(null);
        };
        req.open("GET", REMOTE + "/verify-credentials");
        req.setRequestHeader("ODP-Username", email);
        req.setRequestHeader("ODP-Password-HEX", passwordPublicHash);
        req.send();
        */

        // TODO: Re-enable above, delete below; developing
        setTimeout(function() {
            accept("");
        }, 100);
    });
}

// Attempts to pull the store from the API with the current credentials
// Returns a promise that passes the raw content (response).
// GET /get-store
function getVault() {
    return new Promise(function(accept, reject) {
        /*
        var req = new XMLHttpRequest();
        req.open("GET", REMOTE + "/get-store");
        req.setRequestHeader("ODP-Username", email);
        req.setRequestHeader("ODP-Password-HEX", passwordPublicHash);
        req.onload = function() {
            if (this.status === 200) {
                try {
                    var vault = JSON.parse(sjcl.decrypt(passwordPrivateHash, this.response));
                    accept(vault);
                } catch (e) {
                    reject(this.response, e);
                }
            } else {
                reject(this.response, null);
            }
        }
        req.onerror = function() {
            reject(null, null);
        }
        req.send();
        */
        
        // TODO: Re-enable above, delete below; developing
        setTimeout(function() {
            accept({
                "version": 0,
                "passwords": {
                    "accounts.google.com": [
                        {
                            "username": "username",
                            "password": "password",
                            "updated": 1538091024242,
                            "notes": "I made this password because I felt like it."
                        },
                        {
                            "username": "sister",
                            "password": "Hello World!",
                            "updated": 1246456156456
                        }
                    ],
                    //"*.roblox.com/*": [
                    "www.roblox.com": [ // TODO: Wildcard support
                        {
                            // notice missing "username" field, which is ok
                            "password": "shut up roblox is cool",
                            "updated": 1234567890123
                        }
                    ]
                },
                "secrets": [
                    {
                        "Social Security Number": {
                            "value": "0123456789",
                            "notes": 1234567890123
                        },
                        "Girlfriend Gift Ideas": {
                            "value": 1234567890123
                        }
                    }
                ],
                "sites-nicknames": {
                    "www.google.ca": "Google" // key matches an entry in a password's "sites", including any wildcards
                }
            });
        }, 100);
    });
}

// Attempts to pull the store from the API with the current credentials
// Returns a promise that passes the content (responseText).
// GET /set-store
function setVault() {
    return new Promise(function(accept, reject) {
        /*
        // Encrypt
        var blob = new Blob([sjcl.encrypt(passwordPrivateHash, JSON.stringify(vault))], {"type": "text/plain"});
        
        // Send
        var req = new XMLHttpRequest();
        req.open("POST", REMOTE + "/set-store");
        req.setRequestHeader("ODP-Username", email);
        req.setRequestHeader("ODP-Password-HEX", passwordPublicHash);
        req.onload = function() {
            if (this.status === 200) {
                try {
                    accept(this.response);
                } catch (e) {
                    reject(this.response, e);
                }
            } else {
                reject(this.response, null);
            }
        }
        req.onerror = function() {
            reject(null, null);
        }

        var formData = new FormData();
        formData.append("file", blob, "file");
        req.send(formData);
        */

        // TODO: Re-enable above, delete below; developing
        setTimeout(function() {
            accept("");
        }, 100);
    });
}

// Does a sync
// Gets the old vault, compares it to our version of the old vault (preventing conflicts), then pushes
function doSync() {
    getVault().then(function(new_vault) {
        // Compare with our original vault
        if (JSON.stringify(new_vault) === original_vault) { // Remote did not make changes
            console.log("getsync ok, setting vault");
            setVault().then(function(res) {
               console.log("setVault passed"); 
            }).catch(function(res, err) {
                console.log("setVault failed!", res, err);
            });
        } else { // Remote made changes
            // TODO: Resolve conflicts
            console.log("Error: Conflicts were found.");
            console.log(JSON.stringify(new_vault));
            console.log(original_vault);
        }
    }).catch(function(body, exception) {
        // TODO: Tell user error
    });
}


// Checks if the current URL matches the given URL
// TODO: Fully implement
//
// Intended behavior:
//      "example.com", "example.com" -> true
//      "example.com", "bob.com" -> false
//
//      "example.com", "https://example.com" -> true
//      "*://example.com", "https://example.com" -> true
//      "https://example.com", "http://bob.com" -> false
//      "https://example.com", "bob.com" -> false
//
//      "example.com", "a.example.com" -> false
//      "*.example.com", "foo.example.com" -> true
//      "*.example.com", "foo.bar.example.com" -> false
//      "**.example.com", "foo.bar.example.com" -> true
//      "foo.*.example.com", "foo.bar.example.com" -> true
//      "foo.**.example.com", "foo.bar.example.com" -> true
//      "foo.**.example.com", "foo.bar.baz.example.com" -> true
//
//      "example.com", "example.com/foo" -> true
//      "example.com/*", "example.com/foo" -> true
//      "example.com/*", "example.com/foo/bar" -> false
//      "example.com/**", "example.com/foo/bar" -> true
//      "example.com/*/bar", "example.com/foo/bar" -> true
//      "example.com/**/bar", "foo.bar.example.com/foo/bar" -> true
//      "example.com/**/baz", "foo.bar.example.com/foo/bar/baz" -> true
function siteMatches(pattern, url) {
    // Check protocol
    var protoIndex = pattern.indexOf("://");
    var urlProtoIndex = url.indexOf("://");
    var proto = protoIndex === -1 ? "" : pattern.substring(0, protoIndex);
    var urlProto = urlProtoIndex === -1 ? "" : url.substring(0, urlProtoIndex);

    if (proto !== "" && proto !== "*") {
        if (urlProto === "" || urlProto !== proto) {
            return false;
        }
    }

    if (proto !== "") {
        pattern = pattern.substring(protoIndex + 3);
    }

    if (urlProto !== "") {
        url = url.substring(urlProtoIndex + 3);
    }

    // Check domain
    // TODO: Wildcards (CTRL+F for "Implement domain wildcards here")
    var domainIndex = pattern.indexOf("/");
    domainIndex = domainIndex === -1 ? pattern.length : domainIndex;
    var urlDomainIndex = url.indexOf("/");
    urlDomainIndex = urlDomainIndex === -1 ? url.length : urlDomainIndex;

    var domain = pattern.substring(0, domainIndex);
    var urlDomain = url.substring(0, urlDomainIndex);

    if (domain === "") { // Invalid pattern
        return false;
    }

    // TODO: Implement domain wildcards here (split by periods, probably)
    if (domain !== urlDomain) {
        return false;
    }

    pattern = pattern.substring(domainIndex);
    url = url.substring(urlDomainIndex);

    // Check path
    // TODO: Wildcards (CTRL+F for "Implement path wildcards here")

    // TODO: Implement path wildcards here (split by slashes, probably)
    if (pattern !== "" && pattern !== url) {
        return false;
    }

    // Passed all tests; it matches!
    return true;
}

// Gets passwords for the given URL
function getPasswords(url) {
    if (vault) {
        var passwords = [];

        for (var site in vault.passwords) {
            if (siteMatches(site, url)) {
                passwords = passwords.concat(vault.passwords[site]);
            }
        }

        return passwords;
    } else {
        return [];
    }
}

// Updates the list of passwords fora  tab
function updateTabPasswords(url, tabId) {
    // Get passwords
    var passwords = getPasswords(url);

    // Update badge
    browser.browserAction.setBadgeText({
        "text": passwords.length === 0 ? null : ("" + passwords.length),
        "tabId": tabId
    });

    // Tell popup
    browser.runtime.sendMessage({
        "name": "update-passwords",
        "passwords": passwords
    }).catch(function(err) {
        // Typically occurs when the popup isn't open
        // Might occur some other times tho
        // TODO: Notify user on unexpected error
    });
}

// Monitors the given tab for page changes, and updated passwords accordingly
var lastTabUpdateListener = null;
function monitorTab(tab) {
    if (tab.url) {
        currentUrl = tab.url;
        updateTabPasswords(tab.url, tab.id);
    }

    // Remove old listener
    if (lastTabUpdateListener) {
        browser.tabs.onUpdated.removeListener(lastTabUpdateListener);
        lastTabUpdateListener = null;
    }

    // Add new one
    browser.tabs.onUpdated.addListener(
        function(tabId, changeInfo, tab) {
            if (tab.url !== currentUrl) {
                currentUrl = tab.url;
                updateTabPasswords(tab.url, tab.id);
            }
        },
        {
            "tabId": tab.tabId
        }
    );
}

// Updates the badge for the current tab
// Used in situations where browser.tabs.onUpdated is not called but the passwords are updated.
function updateCurrentBadge() {
    browser.tabs.query({"active": true, "currentWindow": true}).then(function(tabs) {
        updateTabPasswords(tabs[0].url, tabs[0].id); // Should only ever be one
    }).catch(function(err) {
        // TODO: Display error to user?
    });
}

// Listen for messages
browser.runtime.onMessage.addListener(function(msg, sender, senderResponse) {
    // Verify that this is coming from our extension (should be guaranteed, but let's do this just to be safe)
    if (sender.id !== browser.runtime.id) {
        return;
    }

    // Parse message
    if (msg.name === "login") {
        email = msg.email;
        passwordPrivateHash = sjcl.hash.sha256.hash(msg.password);
        passwordPublicHash = null;
        vault = null;

        // Mark as not logged in, set "hashing-password" state
        browser.storage.local.set({
            "current-state": "hashing-password"
        });

        setTimeout(function() { // Give the browser at least a chance to show "hashing the password"
            // Hash public version of password
            var salt = "OYVUXv&b";
            var iterations = 100000;
            var length = 32;
            passwordPublicHash = sjcl.codec.hex.fromBits(sjcl.misc.pbkdf2(msg.password, salt, iterations, length * 8, null));
            msg = undefined;

            // Attempt to login
            browser.storage.local.set({
                "current-state": "logging-in"
            });
            verifyCredentials().then(function() {
                browser.storage.local.set({
                    "current-state": "decrypting-vault"
                });
                getVault().then(function(new_vault) {
                    // Check vault version
                    if (new_vault.version < LATEST_VAULT_VERSION) {
                        // TODO: Upgrade vault to current version
                        // Don't forget to PUSH THE VAULT when you are done upgrades!
                    } else if (new_vault.version > LATEST_VAULT_VERSION) {
                        // TODO: Tell user that they need to update this extension
                    }

                    // Store
                    vault = new_vault;
                    original_vault = JSON.stringify(new_vault);
                    browser.storage.local.set({
                        "current-state": "logged-in",
                        "last-vault-update": new Date().getTime()
                    });

                    // Update badge
                    updateCurrentBadge();
                }).catch(function(body, exception) {
                    // TODO: Tell user error
                });
            })
            .catch(function(body, exception) {
                console.log("verifyCredentials failed");
                console.log(msg);
                console.log(exception);
                // TODO: Update storage to note that password was invalid, include message
            });
        }, 100);
    } else if (msg.name === "logout") {
        email = null;
        passwordPrivateHash = null;
        passwordPublicHash = null;
        vault = null;
        browser.storage.local.set({
            "current-state": "logged-out"
        });

        // Update badge
        updateCurrentBadge();
    } else if (msg.name === "get-passwords") {
        if (currentUrl) {
            senderResponse(getPasswords(currentUrl));
        } else {
            senderResponse([]);
        }
    } else if (msg.name === "get-vault") { // Used by manager only
        senderResponse(vault);
    } else if (msg.name === "set-passwords") { // Used by manager only
        if (vault) {
            // Apply update
            if (!msg.passwords || msg.passwords.length === 0) {
                delete vault.passwords[msg.site];
            } else {
                vault.passwords[msg.site] = msg.passwords;
            }

            // Notify stuff of changes
            browser.storage.local.set({
                "last-vault-update": new Date().getTime()
            });

            // Update badge
            updateCurrentBadge();

            // TODO: Does anything else need to know about the update?
            // Maybe popups open for certain websites?
            // Or will they just update every time a tab is changed,
            // or subscribe to "last-vault-update" themselves?

            // Sync
            doSync();
        }
    }
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
