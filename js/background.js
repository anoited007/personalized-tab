// Helper Functions to execute various functions in the extension. 
// Read about service worker here https://developer.chrome.com/docs/extensions/mv3/service_workers/ 

//Initialize the default configs on first installation.
chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason === "install") {
        // Set default values in storage
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            timeZoneName: 'short',
        });

        const abbreviation = formatter.formatToParts(new Date())
            .find(part => part.type === 'timeZoneName')
            .value;
        chrome.storage.sync.set({
            feedToDisplay: 'security',
            enableTodo: true,
            enableFeed: true,
            enableGreeting:  true,
            enableReligiousQuote: true,
            enableFamousQuote:true,
            enableClock: true,
            cache: true,
            greeting: null,
            timezones: [{
                "timezone": tz,
                "abbreviation": abbreviation
            }]
        },function(data){
            chrome.tabs.create({ url: `chrome-extension://${chrome.runtime.id}/options.html` }, function (tab) {
            });
        });

    }
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    switch (message.action) {
        case 'FETCH_DATA':
            fetch(message.url).then(function (response) {
                return message.feedFormat === 'JSON' ? response.json() : response.text();
            })
                .then(function (data) {
                    // Handle the JSON data here
                    sendResponse(data);
                })
                .catch(function (error) {
                    // Handle errors here
                    console.error("Fetch error:", error);
                });
            return message.isAsync === undefined ? !message.isAsync : message.isAsync;
        case 'SET_DEFAULT_CONFIGURATION':
            // Set default values in storage
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
            const formatter = new Intl.DateTimeFormat('en-US', {
                timeZone: tz,
                timeZoneName: 'short',
            });

            const abbreviation = formatter.formatToParts(new Date())
                .find(part => part.type === 'timeZoneName')
                .value;
            chrome.storage.sync.set({
                feed: message.preset.enableFeed ? message.preset.feed : 'security',
                enableTodo: message.preset.enableTodo || true,
                enableFeed: message.preset.enableFeed || true,
                enableGreeting: message.preset.enableGreeting  || true,
                enableReligiousQuote: message.preset.enableReligiousQuote  || true,
                enableFamousQuote: message.preset.enableFamousQuote  || true,
                enableClock: message.preset.enableClock  || true,
                cache: true,
                greeting: null,
                timezones: [{
                    "timezone": tz,
                    "abbreviation": abbreviation
                }]
            });
            return message.isAsync === undefined ? !message.isAsync : message.isAsync;
    }
    // Return true to indicate that we will send a response asynchronously by default if no Async option was specified
    return message.isAsync === undefined ? !message.isAsync : message.isAsync;
});

