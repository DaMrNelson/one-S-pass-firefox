// Check if the user is logged in
browser.storage.local.get("logged-in").then(function(result) {
    if (result === true) {
        // TODO: Load page
    } else {
        document.location.href = "login.html";
    }
}).catch(function(err) {
    document.location.href = "login.html";
});
