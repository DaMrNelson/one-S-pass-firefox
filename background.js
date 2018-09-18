browser.browserAction.onClicked.addListener(function(info, tab) {
    browser.tabs.executeScript({
        file: `page-loader.js`
        //code: `alert("Hi!");`
    });
});