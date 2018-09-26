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
        req.setRequestHeader("ODP-Password-HEX", sjcl.codec.hex.fromBits(passwordHash));
        req.send();*/

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
        req.setRequestHeader("ODP-Password-HEX", passwordHash);
        req.onload = function() {
            if (this.status === 200) {
                try {
                    var vault = JSON.parse(sjcl.decrypt(passwordHash, this.response));
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
        req.send();*/

        // TODO: Re-enable above, delete below; developing
        setTimeout(function() {
            accept({
                "version": 0,
                "passwords": [
                    {
                        "sites": ["www.google.ca"],
                        "username": "bobio",
                        "password": "testing123"
                    },
                    {
                        "sites": ["www.roblox.com"],
                        "username": null,
                        "password": "Hello World!"
                    }
                ],
                "secrets": [
                    {
                        "Social Security Number": "0123456789",
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
    var vault = sjcl.encrypt(passwordHash, JSON.stringify(vault));
    // TODO: Send to server
}

// Listen for messages
browser.runtime.onMessage.addListener(function(msg) {
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
                    } else if (new_vault.version > LATEST_VAULT_VERSION) {
                        // TODO: Tell user that they need to update this extension
                    }

                    // Store
                    vault = new_vault;
                    browser.storage.local.set({
                        "current-state": "logged-in"
                    });
                    console.log("Loaded vault!", vault); // TODO: Remove; testing
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
    }
});
