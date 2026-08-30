// Get the main container
const settingContainer = document.getElementById('settings-container')
let feedToDisplay
let feed
let cache
let greeting
let timezones
let enableTodo
let enableFeed
let enableGreeting
let enableReligiousQuote
let enableFamousQuote
let enableClock

generateOptions()

function elments() {
    feedToDisplay = document.getElementById('feedToDisplay');
    feed = document.getElementById('feed');
    cache = document.getElementById('cache');
    greeting = document.getElementById('greeting');
    timezones = document.getElementById('timezones');
    enableTodo = document.getElementById('enableTodo');
    enableFeed = document.getElementById('enableFeed');
    enableGreeting = document.getElementById('enableGreeting');
    enableReligiousQuote = document.getElementById('enableReligiousQuote');
    enableFamousQuote = document.getElementById('enableFamousQuote');
    enableClock = document.getElementById('enableClock');

    // Add Listeners
    document.getElementById('save').addEventListener('click', save_options);
    document.getElementById('reset').addEventListener('click', reset);


}
//prefill current settings. 
function prefillConfig() {
    chrome.storage.sync.get(null, function (configs) {
        greeting.value = configs.greeting || ''
        feed.value = configs.feed|| ''
        enableTodo.checked = configs.enableTodo
        enableFeed.checked = configs.enableFeed
        enableGreeting.checked = configs.enableGreeting
        enableReligiousQuote.checked = configs.enableReligiousQuote
        enableFamousQuote.checked = configs.enableFamousQuote
        enableClock.checked = configs.enableClock
        // preslected options for feed and timezones are already done during creation of the options
    })
}

// Saves options to chrome.storage
function save_options() {
    const selectedOptions = []
    for (let timezone of timezones.options) {
        if (timezone.selected) {
            // prepare the timezone abbreviation so we don't have to do it later in the clock
            const formatter = new Intl.DateTimeFormat('en-US', {
                timeZone: timezone.value,
                timeZoneName: 'short'
            });

            const abbreviation = formatter.formatToParts(new Date())
                .find(part => part.type === 'timeZoneName')
                .value;

            selectedOptions.push({
                "timezone": timezone.value,
                "abbreviation": abbreviation
            })
        }
    }

    chrome.storage.sync.set({
        feedToDisplay: feed.value ? 'custom' : feedToDisplay.value,
        feed: feed.value,
        enableTodo: enableTodo.checked,
        enableFeed: enableFeed.checked,
        enableGreeting: enableGreeting.checked,
        enableReligiousQuote: enableReligiousQuote.checked,
        enableFamousQuote: enableFamousQuote.checked,
        enableClock: enableClock.checked,
        greeting: greeting.value,
        timezones: selectedOptions
    }, function () {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function () {
            status.textContent = '';
        }, 750);
    });
}

function reset() {
    // Update status to let user know options were saved.
    chrome.runtime.sendMessage({
        action: "SET_DEFAULT_CONFIGURATION",
        preset: {
            feed: '',
            greeting: '',
            enableFeed: true,
            enableTodo: true,
            cache: true,
            enableGreeting: true,
            enableReligiousQuote: true,
            enableFamousQuote: true,
            enableClock: true
        },
        isAsync: false
    })
    var status = document.getElementById('status');
    document.getElementById('greeting').value = ''
    status.textContent = 'Options Reset.';
    setTimeout(function () {
        status.textContent = '';
    }, 750);
}

function generateOptions() {
    chrome.storage.sync.get(null, function (result) {
        chrome.runtime.sendMessage({ action: "FETCH_DATA", dataType: "JSON", url: 'https://worldtimeapi.org/api/timezone' }, function (response) {
            // Greeting Elements    
            let greetingContainer = document.createElement('div')
            let greetingheading = document.createElement('h2')
            greetingheading.textContent = 'Greeting: ex name or mantra'
            let input = document.createElement('input')
            input.type = 'text'
            input.id = 'greeting'
            input.placeholder = 'Greeting'
            input.classList.add('input')
            greetingContainer.appendChild(greetingheading)
            greetingContainer.appendChild(input)
            settingContainer.appendChild(greetingContainer)

            // Custom Feed Elements
            let customFeedContainer = document.createElement('div')
            let customFeedHeading = document.createElement('h2')
            customFeedHeading.innerHTML = 'Custom Feed: e.g: <a target="_blank" href="https://www.prlog.org/free-rss-feeds.html">Free RSS Feeds</a>'
            let customFeedInput = document.createElement('input')
            customFeedInput.type = 'text'
            customFeedInput.id = 'feed'
            customFeedInput.placeholder = 'Comma separated XML feed links'
            customFeedInput.classList.add('input')
            customFeedContainer.appendChild(customFeedHeading)
            customFeedContainer.appendChild(customFeedInput)
            settingContainer.appendChild(customFeedContainer)

            // Feed to Display Elements    
            let feedToDisplayContainer = document.createElement('div')
            feedToDisplayContainer.classList.add('box')
            let feedToDisplayHeading = document.createElement('h2')
            feedToDisplayHeading.textContent = 'Feed to Display'
            let feedToDisplaySelect = document.createElement('select')
            feedToDisplaySelect.id = 'feedToDisplay'
            feedToDisplayContainer.appendChild(feedToDisplayHeading)
            feedToDisplayContainer.appendChild(feedToDisplaySelect)
            settingContainer.appendChild(feedToDisplayContainer)

            // Feed options
            var feed = new Map()
            feed.set('ai', 'AI News')
            feed.set('security', 'Security')
            feed.set('custom', 'Custom Feed')
            feed.set('all', 'All')

            feed.forEach((value, key) => {
                option = document.createElement('option')
                option.value = key
                if (result.feedToDisplay === key) {
                    option.selected = true
                }
                option.textContent = value
                feedToDisplaySelect.append(option)
            });

            let featureContainer = document.createElement('div')
            let featureHeading = document.createElement('h2')
            featureHeading.textContent = 'Feature Configurations'
            featureContainer.appendChild(featureHeading)
            var configs = new Map()
            configs.set('enableTodo', 'Enable Todo')
            configs.set('enableFeed', 'Enable Feed')
            configs.set('enableGreeting', 'Enable Greeting')
            configs.set('enableReligiousQuote', 'Enable Religious Quote')
            configs.set('enableFamousQuote', 'Enable Famous Quote')
            configs.set('enableClock', 'Enable Clock')
            configs.set('greeting', 'Enable Greeting')

            configs.forEach((configName, configId) => {
                featureLabel = document.createElement('label')
                featureLabel.classList.add('container')
                featureLabel.textContent = configName
                featureInput = document.createElement('input')
                featureInput.type = 'checkbox'
                featureInput.id = configId
                featureInput.checked = 'checked'
                featureLabel.appendChild(featureInput)
                featureSpan = document.createElement('span')
                featureSpan.classList.add('checkmark')
                featureLabel.appendChild(featureSpan)
                featureContainer.appendChild(featureLabel)

            })
            settingContainer.appendChild(featureContainer)

            // Timerzone Elements
            let timezonesContainer = document.createElement('div')
            let timezonesHeading = document.createElement('h2')
            timezonesHeading.textContent = 'Timezones to Display'
            timezonesContainer.appendChild(timezonesHeading)
            let timezonesSubheading = document.createElement('p')
            timezonesSubheading.textContent = 'Hold down the Ctrl (or Command on Mac) key while clicking on the options'
            timezonesContainer.appendChild(timezonesSubheading)
            let box = document.createElement('div')
            box.classList.add('box')
            let timezonesSelect = document.createElement('select')
            timezonesSelect.id = 'timezones'
            timezonesSelect.multiple = true

            tz = new Set()
            if (result.timezones) {
                result.timezones.forEach(e => {
                    //Using a set just for the efficiency of check if it has an element later
                    tz.add(e.timezone)
                })
                for (const element of JSON.parse(response)) {
                    option = document.createElement('option')
                    option.value = element

                    if (tz.has(element)) {
                        option.selected = true
                    }

                    option.textContent = element
                    timezonesSelect.append(option)
                };
            }
            box.appendChild(timezonesSelect)
            timezonesContainer.appendChild(box)
            settingContainer.appendChild(timezonesContainer)


            let status = document.createElement('div')
            status.id = 'status'
            settingContainer.appendChild(status)

            let saveBtn = document.createElement('button')
            saveBtn.classList.add('btn')
            saveBtn.id = 'save'
            saveBtn.textContent = 'Save'
            let resetBtn = document.createElement('button')
            resetBtn.classList.add('btn')
            resetBtn.id = 'reset'
            resetBtn.textContent = 'Reset Configuration'

            let btnContainer = document.createElement('div')
            btnContainer.appendChild(saveBtn)
            btnContainer.appendChild(resetBtn)
            settingContainer.appendChild(btnContainer)

            // &#43
            elments()
            prefillConfig()
        })
    }
    )

}
