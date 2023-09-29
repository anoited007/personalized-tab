// Helper Functions to execute various functions in the extension. 
// Read about service worker here https://developer.chrome.com/docs/extensions/mv3/service_workers/ 

function getTimezoneOffset(targetTimezone) {
    console.log(targetTimezone);
    // Use the computer's current timezone if no target timezone is provided
    targetTimezone = targetTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Create Date objects for the current time in the target timezone and UTC
    const currentTimeInUTC = new Date();
    const currentTimeInTargetTimezone = new Date().toLocaleString('en-US', { timeZone: targetTimezone });

    // Calculate the offset in milliseconds
    const timezoneOffsetMilliseconds = new Date(currentTimeInTargetTimezone) - currentTimeInUTC;
    return { timezone: targetTimezone, offset: timezoneOffsetMilliseconds };
}

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
                let timezoneAndOffset = getTimezoneOffset()
                console.log(timezoneAndOffset);
                chrome.storage.sync.set({
                    news: 'security',
                    cache: true,
                    username: null,
                    timezones: [{
                        "timezone": timezoneAndOffset.timezone,
                        "offset": timezoneAndOffset.offset
                    }]
                });
            return message.isAsync === undefined ? !message.isAsync : message.isAsync;
        case 'GET_TIMEZONE_AND_OFFSET':
            console.log(message.targetTimezone);
            sendResponse(getTimezoneOffset(message.targetTimezone))
            return message.isAsync === undefined ? !message.isAsync : message.isAsync;

    }
    // Return true to indicate that we will send a response asynchronously by default if no Async option was specified
    return message.isAsync === undefined ? !message.isAsync : message.isAsync;
});