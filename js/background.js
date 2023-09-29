chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === "fetchQuotes") {
        fetch("https://api.quotable.io/quotes/random", {
            method: "GET",
            headers: {
                "Accept": "application/json"
            },
        }).then(function (response) {
                return response.json();
            })
            .then(function (data) {
                // Handle the JSON data here
                sendResponse(data[0]);
            })
            .catch(function (error) {
                // Handle errors here
                console.error("Fetch error:", error);
            });

        // Return true to indicate that we will send a response asynchronously
        return true;
    }
});