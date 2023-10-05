var feedToDisplay;
var cache;
var timeInit = false
var links = [
    {
        link: 'https://feeds.feedburner.com/eset/blog',
        category: 'security',
        feedFormat: 'XML'
    },
    {
        link: 'https://securityaffairs.co/wordpress/feed',
        category: 'security',
        feedFormat: 'XML'
    },
    {
        link: 'https://www.darkreading.com/rss_simple.asp',
        category: 'security',
        feedFormat: 'XML'
    },
    {
        link: 'https://www.wired.com/feed/tag/ai/latest/rss',
        category: 'ai',
        feedFormat: 'XML'
    },
];

const options = {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    weekday: 'short',
    hour12: false // Todo: Give users the option to choose the time format
};

$("#bg").ripples({
    resolution: 500,
    dropRadius: 40,
    perturbance: 0.002,
    interactive: true,
    crossOrigin: true
});
let midsection
//When document is ready get configs
$(document).ready(function () {
    midsection = document.createElement("section");
    midsection.classList.add('layout')
    midsection.id = 'middle'
    document.getElementById('container').appendChild(midsection)

    chrome.storage.sync.get(null, function (result) {
        // Get greeting
        // Arrangement is import because of how they are injected into the DOM
        if (result.enableGreeting) {
            getGreeting()
        }
        if (result.enableFeed) {
            getFeed()
        }
        if (result.enableClock) {
            let container = document.createElement('div')
            container.id = 'bottom-container'
            let time = document.createElement('div')
            time.id = 'time'
            let clockSpan = document.createElement('span')
            clockSpan.id = 'clock'
            time.appendChild(clockSpan)
            container.appendChild(time)
            midsection.appendChild(container)
            setInterval(() => getClock(result.timezones))
        }
        if (result.enableReligiousQuote) {
            getReligiousQuote()
        }
        if (result.enableFamousQuote) {
            getFamousQuote()
        }
    });
})

const cors = "https://corsproxy.io/?";

// Todo: implement caching and also check to quote 24 hour later
function getReligiousQuote() {
    chrome.runtime.sendMessage({ action: "FETCH_DATA", feedFormat: "JSON", url: "https://beta.ourmanna.com/api/v1/get?format=json&order=daily" }, function (data) {
        if (data) {
            $(".dailyVersesWrapper").prepend();
            let religiousQuote = document.createElement('div')
            religiousQuote.classList.add('dailyVersesWrapper')
            religiousQuote.textContent = data.verse.details['text']
            let linkToVerseWebsite = document.createElement('div')
            linkToVerseWebsite.classList.add('dailyVerses', 'linkToWebsite')
            linkToVerseWebsite.textContent = data.verse.details['reference'] + ' ' + data.verse.details['version']
            religiousQuote.appendChild(linkToVerseWebsite)
            midsection.appendChild(religiousQuote)
        }
    });

}

function getFamousQuote() {
    chrome.runtime.sendMessage({ action: "FETCH_DATA", feedFormat: "JSON", url: "https://api.quotable.io/quotes/random" }, function (data) {
        let quoteContainer = document.createElement('div')
        quoteContainer.id = 'quotes'
        midsection.appendChild(quoteContainer)
        let quote = document.createElement("p");
        quoteContainer.appendChild(quote);
        quote.innerText = data[0]["content"];
        let author = document.createElement("p");
        author.id = "author"
        author.innerText = "Author: "
        let authorName = data[0]["author"];
        let link = document.createElement("a");
        link.rel = "noopener noreferrer";
        link.target = "_blank"
        let baseURL = "https://www.google.com/search?q="
        link.href = baseURL + encodeURIComponent(authorName);
        link.innerText = authorName;
        let authorContent = document.createElement("span");
        authorContent.appendChild(link);
        author.appendChild(authorContent);
        quote.appendChild(author);
    });
}

function getClock(timezones) {
    // Clear existing clock elements
    clocks = document.querySelector("#clock")
    timeInit = clocks.childNodes.length === timezones.length ? true : false

    timezones.forEach(function (timezone, i) {
        const time = new Date().toLocaleString('en-US', { timeZone: timezone.timezone, ...options });
        if (!timeInit) {
            let timeContainer = document.createElement("div");
            timespan = document.createElement("span");
            timespan.id = "clock-" + i;
            timespan.textContent = time
            timeContainer.appendChild(timespan)
            abbrspan = document.createElement("span");
            abbrspan.textContent = timezone.abbreviation
            abbrspan.classList.add("clock-abbreviation");
            timeContainer.appendChild(abbrspan)
            clocks.appendChild(timeContainer);
        } else {
            clock = document.querySelector("#clock-" + i)
            clock.textContent = time
        }
    })
}


function getFeed() {
    chrome.storage.sync.get(null, function (items) {
        //Get feed container.
        const feedSectionContainer = document.querySelector("#container");
        // Create container
        let feedContainer = document.createElement('section')
        feedContainer.id = 'feed-container'
        feedContainer.classList.add('layout')
        let title = document.createElement('h1')
        title.id = 'title'

        feedSectionContainer.insertBefore(feedContainer, feedSectionContainer.firstChild)

        let allSources = document.createElement("ul");
        allSources.setAttribute("class", "allSources");
        var url;

        feed = items.feed;
        cache = items.cache;
        customFeedURL = items.feed
        if (customFeedURL) {
            customFeedURL.split(',').forEach((link) => {
                links.push({ link: link, feedFormat: 'XML', category: 'custom' })
            })
        }


        for (let link of links) {
            if (link.category === items.feedToDisplay || items.feedToDisplay === 'all') {
                chrome.runtime.sendMessage({ action: "FETCH_DATA", feedFormat: link.feedFormat, url: cors + link.link }, function (response) {
                    let data = parseFeedToObj(response)
                    bindToView(feedContainer, allSources, data);
                })
            }
        }
    });
};


function getGreeting() {
    chrome.storage.sync.get('greeting', function (configs) {
        if (configs.greeting) {
            let greetingContainer = document.createElement("div");
            let name = document.createElement("p")
            name.id = 'greeting'
            name.textContent = configs.greeting
            greetingContainer.appendChild(name)
            midsection.insertBefore(greetingContainer,midsection.childNodes.firstChild)
        } else {
            // Greeting Elements    
            let greetingContainer = document.createElement("div");
            let input = document.createElement('input')
            input.type = 'text'
            input.id = 'nameInput'
            input.placeholder = 'Greeting or Mantra'
            input.classList.add('input')
            greetingContainer.appendChild(input)
            midsection.appendChild(greetingContainer)
        }
    });
}

$("#nameInput").on('keypress', function (e) {
    if (e.which === 13) {
        chrome.storage.sync.set({ 'greeting': $("#nameInput").val() });
        document.getElementById("nameInput").style.display = "none";
        getGreeting();
    }
});

/*Helper Functions*/
function classStringGen(string) {
    return string.toLowerCase().replace(' ', '')
}

function NewsDetail(source, data) {
    this.source = source;
    this.data = data;
}

function bindToView(feedContainer, allSources, feedDetails) {
    let source = document.createElement("p");
    source.classList.add("feed-source");
    source.textContent = feedDetails.source;
    feedContainer.appendChild(source);

    const li = document.createElement('li');
    li.innerText = source.textContent;
    li.setAttribute("class", classStringGen(source.innerText));
    allSources.append(li);

    for (const item of feedDetails.data) {
        let feedItem = document.createElement("div");
        feedItem.classList.add("feed", "card");
        let title = item.title
        let url = item.link
        let link = document.createElement("a");
        link.href = url;
        link.innerHTML = title;
        link.rel = "noreferrer noopener"
        link.target = "_blank";
        feedItem.appendChild(link);
        feedContainer.appendChild(feedItem);
    }
}

function parseFeedToObj(rssData) {
    // Parse the RSS data using DOMParser
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(rssData, 'application/xml');

        // Initialize an empty array to store the parsed JSON data
        const items = [];

        const source = xmlDoc.querySelector('channel');
        const title = source.querySelector('title').textContent;
        const link = source.querySelector('link').textContent;

        // Extract data from the XML
        const rssItems = xmlDoc.querySelectorAll('item');
        rssItems.forEach((item) => {
            const title = item.querySelector('title').textContent;
            const link = item.querySelector('link').textContent;
            const description = item.querySelector('description').textContent;
            const pubDate = item.querySelector('pubDate').textContent;

            items.push({
                title,
                link,
                description,
                pubDate,
            });
        });

        // Convert the array of items to JSON
        return { source: title, data: items }
    } catch (e) {
        console.error('Error parsing feed')
    }
}