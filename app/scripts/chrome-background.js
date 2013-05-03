(function (chrome) {

    'use strict';

    chrome.browserAction.onClicked.addListener(function (tab) {
        chrome.tabs.create({'url': chrome.extension.getURL('index.html?' + tab.id)});
    });

})(window.chrome);