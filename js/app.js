var news;
var cache;
var timeInit=false
var links = [
    {
        link: 'https://feeds.feedburner.com/eset/blog',
        category: 'security',
        feedFormat:'XML'
    },
    {
        link: 'https://securityaffairs.co/wordpress/feed',
        category: 'security',
        feedFormat:'XML'
    },
    {
        link: 'https://www.darkreading.com/rss_simple.asp',
        category: 'security',
        feedFormat:'XML'
    },
    {
        link: 'https://www.wired.com/feed/tag/ai/latest/rss',
        category: 'ai',
        feedFormat:'XML'
    },
];

//Initialize the default configs on first installation.
chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason === "install") {
        chrome.runtime.sendMessage({ action: "SET_DEFAULT_CONFIGURATION"})
        console.log('Initializing default configs');
    }
});

$("#bg").ripples({
    resolution: 500,
    dropRadius: 40,
    perturbance: 0.002,
    interactive: true,
    crossOrigin: true
});

//When document is ready get configs
$(document).ready(function () {
    // Get username
    getName()
    // Get Famous Quotes
    getQuote()
    // Get timeszones. 
    chrome.storage.sync.get('timezones', function (result) {
        getTime(result.timezones);
    });
  getNews();
});


const cors = "https://corsproxy.io/?";

// Todo: implement caching and also check to quote 24 hour later
fetch('https://beta.ourmanna.com/api/v1/get?format=json&order=daily')
    .then((response) => {
        // Check if the response status is OK (status code 200)
        if (response.ok) {
            // Parse the JSON response
            return response.json();
        } else {
            throw new Error('Failed to fetch data');
        }
    })
    .then((data) => {
        $(".dailyVersesWrapper").prepend(data.verse.details['text'] + ' ' + data.verse.details['reference'] + ' ' + data.verse.details['version']);
    })
    .catch((error) => {
        $(".dailyVersesWrapper").prepend(localStorage.getItem("previousBibleQuote"));
    });

function getQuote() {
    chrome.runtime.sendMessage({ action: "FETCH_DATA", feedFormat: "JSON", url: "https://api.quotable.io/quotes/random" }, function (data) {
        const quotesContainter = document.querySelector("#quotes");
        let quote = document.createElement("p");
        quotesContainter.appendChild(quote);
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
function getTime(timezones) {
    // Clear existing clock elements
    clocks = document.querySelector("#clock")
    for (const timezone of timezones) {
        timeInit = clocks.childNodes.length === timezones.length ? true : false
        let date = new Date();
        let utc = date.getTime() + date.getTimezoneOffset() * 60000;
        let timeInSelectedTimezone = new Date(utc + timezone.offset);

        let hour = timeInSelectedTimezone.getHours();
        let min = timeInSelectedTimezone.getMinutes();
        let sec = timeInSelectedTimezone.getSeconds();

        min = checkTime(min);
        sec = checkTime(sec);

        if (!timeInit) {
            let timeContainer= document.createElement("div");
            timeContainer.id = "clock-" + timezone.offset;
            labelspan = document.createElement("span");
            labelspan.textContent = timezone.timezone + " :"
            labelspan.classList.add('clock-label')
            timeContainer.appendChild(labelspan)
            timespan = document.createElement("span");
            timespan.textContent =  hour + ":" + min + ":" + sec;
            timeContainer.appendChild(timespan)
            clocks.appendChild(timeContainer);
        } else {
            clock = document.querySelector("#clock-" + timezone.offset).childNodes[1]
            clock.textContent = hour + ":" + min + ":" + sec;
        }
    }

    let t = setTimeout(() => getTime(timezones), 500);
}

// Helper function to add leading zeros
function checkTime(i) {
    return (i < 10 ? "0" : "") + i;
}

function getNews() {
    //Get news container.
    const newsContainer = document.querySelector("#news-container");
    let allSources = document.createElement("ul");
    allSources.setAttribute("class", "allSources");
    var url;

    chrome.storage.sync.get({
        news: 'security',
        cache: true
    }, function (items) {
        news = items.news;
        cache = items.cache;
        $('#title').text('FEED ON '+items.news.toUpperCase());
            for (const link of links) {
                if(link.category===items.news){
                    chrome.runtime.sendMessage({ action: "FETCH_DATA", feedFormat: link.feedFormat, url: cors+link.link }, function (response) {
                       console.log(response)
                        let data = parseFeedToObj(response)
                       console.log(data)
                        bindToView(newsContainer, allSources, data);
                    })
                }
            }
    });
};


function getName() {
    chrome.storage.sync.get('username', function (configs) {
        const name = configs.username;
        if (name) {
            const p = document.getElementById("username");
            p.innerText = p.innerText + " " + name;
            document.getElementById("nameInput").style.display = "none";
        } else {
            document.getElementById("nameInput").style.display = "block";
        }
    });
}

$("#nameInput").on('keypress', function (e) {
    if (e.which === 13) {
        chrome.storage.sync.set({'username': $("#nameInput").val()});
        document.getElementById("nameInput").style.display = "none";
        getName();
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

function bindToView(newsContainer, allSources, newsDetails) {
    let source = document.createElement("p");
    source.classList.add("news-source");
    source.textContent = newsDetails.source;
    newsContainer.appendChild(source);

    const li = document.createElement('li');
    li.innerText = source.textContent;
    li.setAttribute("class", classStringGen(source.innerText));
    allSources.append(li);

    for (const item of newsDetails.data) {
        let newsItem = document.createElement("div");
        newsItem.classList.add("news", "card");
        let title = item.title
        let url = item.link
        let link = document.createElement("a");
        link.href = url;
        link.innerHTML = title;
        link.rel = "noreferrer noopener"
        link.target = "_blank";
        newsItem.appendChild(link);
        newsContainer.appendChild(newsItem);
    }
}

function parseFeedToObj(rssData) {
    console.log(rssData);
    // Parse the RSS data using DOMParser
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
    return {source:title,data:items}
}