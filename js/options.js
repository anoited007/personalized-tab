// Saves options to chrome.storage
function save_options() {
    var news = document.getElementById('news').value;
    var cache = document.getElementById('cache').checked;
    var username = document.getElementById('username').value;
    chrome.storage.sync.set({
        news: news,
        cache: cache,
        username: username
    }, function () {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function () {
            status.textContent = '';
        }, 750);
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get({
        news: 'security',
        cache: true,
        username: null
    }, function (items) {
        document.getElementById('username').value = items.username;
    });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);

function reset() {
    chrome.storage.sync.get({
        news: 'security',
        cache: true,
        username: null
    }, function (items) {
        localStorage.setItem('news' ,items.news);
    });
}