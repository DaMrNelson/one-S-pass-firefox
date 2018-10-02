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
                    "accounts.google.ca": [
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
        /*// Encrypt
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
        req.send(formData);*/

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

        setTimeout(function() { // Give the browser at least a chance to hash the password
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
    } else if (msg.name === "get-passwords") {
        // TODO: Give passwords for the given site
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

            // TODO: Does anything else need to know about the update?
            // Maybe popups open for certain websites?
            // Or will they just update every time a tab is changed,
            // or subscribe to "last-vault-update" themselves?

            // Sync
            doSync();
        }
    }
});
