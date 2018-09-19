//var remote = "https://api.nschramm.com:14137";
var REMOTE = "http://127.0.0.1:14137";
var SALT = "OYVUXv&b";

// Current login info
var email = null;
var password = null;
var passwordHash = null;

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
        req.setRequestHeader("ODP-Password-HEX", passwordHash);
        req.send();
    });
}

// Attempts to pull the store from the API with the current credentials
// Returns a promise that passes the raw content (response).
// GET /get-store
function getStore() {
    return new Promise(function(accept, reject) {
        var req = new XMLHttpRequest();
        req.open("GET", REMOTE + "/get-store");
        req.setRequestHeader("ODP-Username", email);
        req.setRequestHeader("ODP-Password-HEX", passwordHash);
        req.onload = function() {
            if (this.status === 200) {
                accept(this.response);
            } else {
                reject(this.response);
            }
        }
        req.onerror = function() {
            reject(null);
        }
        req.send();
    });
}

// Attempts to pull the store from the API with the current credentials
// Returns a promise that passes the content (responseText).
// GET /set-store
function setStore() {
    // TODO: This
}

// Listen for messages
browser.runtime.onMessage.addListener(function(msg) {
    if (msg.name === "login") {
        email = msg.email;
        password = msg.password;
        // TODO: Set "logged out" state

        // Hash password
        var key = password;
        console.log("Hashing", key);
        var salt = "OYVUXv&b";
        var iterations = 100000;
        var length = 32;
        passwordHash = sjcl.codec.hex.fromBits(sjcl.misc.pbkdf2(key, salt, iterations, length * 8, null));
        console.log("Hashed to", passwordHash);

        verifyCredentials().then(function() {
            console.log("verifyCredentials passed!");
            // TODO: Put username and logged in state in store

            getStore().then(function(store) {
                // Decrypt
                // TODO: Use AES CBC with a 256-bit IV (IV should be randomly generated differently every single time it is encrypted)
                // Put the IV as the first 256 bits of the file or something, just in terms of storage
                
                console.log(store);
                // TODO: Decrypt
            });
        })
        .catch(function(msg) {
            console.log("verifyCredentials failed");
            console.log(msg);
            // TODO: Update storage to note that password was invalid, include message
        });
    }
});
