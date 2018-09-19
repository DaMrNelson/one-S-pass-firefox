//var remote = "https://api.nschramm.com:14137";
var REMOTE = "http://localhost:14137";
var SALT = "OYVUXv&b";

// Current login info
var email = null;
var password = null;

// Verifies that the current credentials are correct
// Returns a promise that contains the content.
// GET /verify-credentials
function verifyCredentials() {
    return new Promise(function(accept, reject) {
        var req = new XMLHttpRequest();
        req.setRequestHeader("ODP-Username", browser.storage.local.get("email"));
        req.setRequestHeader("ODP-Password", browser.storage.local.get("password"));
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
        req.open("GET", REMOTE + "/verify-credentials");
        req.send();
    });
}

// Attempts to pull the store from the API with the current credentials
// GET /get-store
function getStore() {
    // TODO: This
}

// Attempts to pull the store from the API with the current credentials
// GET /set-store
function setStore() {
    // TODO: This
}

// Listen for messages
browser.runtime.onMessage.addListener(function(msg) {
    if (msg === "login") {
        email = msg.email;
        password = msg.password;
        
        if (!isLoggedIn) {
            verifyCredentials(msg.name, msg.password).then(function() {
                // TODO: Send "password valid"
                // TODO: Complete their login
                // TODO: Send "login complete" once login is complete
            })
            .catch(function(msg) {
                // TODO: Send "password invalid"
            });
        }
    }
});
