//var remote = "https://api.nschramm.com:14137";
var REMOTE = "http://127.0.0.1:14137";
var SALT = "OYVUXv&b";

// Current login info
var email = null;
var passwordPrivateHash = null;
var passwordPublicHash = null;

// Vault (store in memory ofc)
var vault = null;

// Verifies that the current credentials are correct
// Returns a promise that passes the content (responseText).
// GET /verify-credentials
function verifyCredentials() {
    return new Promise(function(accept, reject) {
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
        req.send();
    });
}

// Attempts to pull the store from the API with the current credentials
// Returns a promise that passes the raw content (response).
// GET /get-store
function getVault() {
    return new Promise(function(accept, reject) {
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
        req.send();
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
        // TODO: Set "logged out" state

        // Hash public version of password
        var salt = "OYVUXv&b";
        var iterations = 100000;
        var length = 32;
        passwordPublicHash = sjcl.codec.hex.fromBits(sjcl.misc.pbkdf2(msg.password, salt, iterations, length * 8, null));
        msg = undefined;

        // Attempt to login
        verifyCredentials().then(function() {
            console.log("verifyCredentials passed!");
            // TODO: Put username and logged in state in store

            getVault().then(function(new_vault) {
                vault = new_vault;

                if (vault === null) {
                    // TODO: Tell user error
                } else {
                    // TODO: Tell user success
                }
            });
        })
        .catch(function(body, exception) {
            console.log("verifyCredentials failed");
            console.log(msg);
            console.log(exception);
            // TODO: Update storage to note that password was invalid, include message
        });
    }
});
