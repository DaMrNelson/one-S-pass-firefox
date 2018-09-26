// Check if the user is logged in
browser.storage.local.get("current-state").then(function(res) {
    var result = res["current-state"];

    if (result === "logged-in") {
        // TODO: Load page
    } else {
        document.location.href = "login.html";
    }
}).catch(function(err) {
    document.location.href = "login.html";
});
