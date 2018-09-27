// Current vault
//var vault = null;
var vault = {
    "version": 0,
    "passwords": {
        "www.google.ca": [
            {
                "username": "bobio",
                "password": "testing123"
            },
            {
                "username": "sister",
                "password": "Hello World!"
            }
        ],
        "www.roblox.com": [
            {
                "username": null,
                "password": "shut up roblox is cool"
            }
        ]
    },
    "secrets": [
        {
            "Social Security Number": "0123456789",
        }
    ],
    "sites-nicknames": {
        "www.google.ca": "Google" // key matches an entry in a password's "sites", including any wildcards
    }
};
// TODO: Change back; testing

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
        var passwords = vault.passwords[site];

        // Create element
        var $elm = $template.clone();
        $elm.find(".card-title").text(site);
        $elm.attr("id", "");
        $elm.show();
        $("#password-display").append($elm);
        console.log($elm);

        // Animate element
        // TODO: That
    }
    // TODO: Display values and stuff
    console.log("Vault was updated! Now:", vault); // TODO: Remove; testing
}

// Setup document
$(document).ready(function() {
    vaultUpdated(); // TODO: Remove; testing

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
/*browser.storage.onChanged.addListener(function(changes, areaName) {
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
});*/
