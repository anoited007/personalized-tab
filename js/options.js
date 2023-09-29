var news = document.getElementById('news');
var cache = document.getElementById('cache');
var username = document.getElementById('username');
var timezones = document.getElementById('timezones');

//prefill current settings. 
function prefillConfig() {
    chrome.storage.sync.get(null, function (configs) {
        username.value = configs.username || ''
        cache.checked = cache.checked

        // preslected options for news and timezones are already done during creation of the options
    })
}

prefillConfig()

// Saves options to chrome.storage
function save_options() {
    var selectedTimezones = [];
    var selectedOptions = []
    for (var i = 0; i < timezones.length; i++) {
        if (timezones[i].selected) {
            selectedOptions.push(timezones[i].value)
        }
    }

    if (selectedOptions.length === 0) {
        chrome.runtime.sendMessage({ action: "GET_TIMEZONE_AND_OFFSET", isAsync: false }, function (result) {
            selectedTimezones.push({
                "timezone": result.timezone,
                "offset": result.offset
            })
        })
    }
    for (var i = 0; i < selectedOptions.length; i++) {
        chrome.runtime.sendMessage({ action: "GET_TIMEZONE_AND_OFFSET", targetTimezone: selectedOptions[i],isAsync: false, }, function (result) {
            selectedTimezones.push({
                "timezone": result.timezone,
                "offset": result.offset
            })
            //Due to async nature of background.js messages only set when the selected times and options are equal
            if(selectedTimezones.length===selectedOptions.length){
                chrome.storage.sync.set({timezones: selectedTimezones})
            }
        })
    }
    

    chrome.storage.sync.set({
        news: news.value,
        cache: cache.checked,
        username: username.value,
    }, function () {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function () {
            status.textContent = '';
        }, 750);
    });
}

document.getElementById('save').addEventListener('click', save_options);
document.getElementById('reset').addEventListener('click', reset);

function reset() {
    // Update status to let user know options were saved.
    chrome.runtime.sendMessage({ action: "SET_DEFAULT_CONFIGURATION", isAsync: false })
    var status = document.getElementById('status');
    document.getElementById('username').value = ''
    status.textContent = 'Options Reset.';
    setTimeout(function () {
        status.textContent = '';
    }, 750);
}

function fetchTimezones() {
    chrome.runtime.sendMessage({ action: "FETCH_DATA", dataType: "JSON", url: 'https://worldtimeapi.org/api/timezone' }, function (response) {
        select = document.getElementById('timezones')
        chrome.storage.sync.get('timezones',function(result){
            tz= new Set()
            result.timezones.forEach(e=>{
                //Using a set just for the efficiency of check if it has an element later
                tz.add(e.timezone)
            })
            response.forEach(element => {
                option = document.createElement('option')
                option.value = element
                
                if(tz.has(element)){
                    option.selected=true 
                }
                parts = element.split('/')
                option.textContent = parts[parts.length - 1].replace(/_/g, ' ');
                select.append(option)
            });
        })
        
    })
}

function createFeedOptions(){
    var feed = new Map()
    feed.set('security','Security')
    feed.set('ai','AI news')
    feed.set('all','All')
    

    chrome.storage.sync.get('news',function(result){
        select = document.getElementById('news')
        feed.forEach((value,key) => {
            option = document.createElement('option')
            option.value = key
            
            if(result.news===key){
                option.selected=true 
            }
            option.textContent = value
            select.append(option)
        });
    })
}

fetchTimezones()
createFeedOptions()