var news;
var cache;
var links = [
    {
        link: 'https://api.rss2json.com/v1/api.json?rss_url=http%3A%2F%2Ffeeds.feedburner.com%2Feset%2Fblog',
        enabled: true
    },
    {
        link: 'https://api.rss2json.com/v1/api.json?rss_url=http%3A%2F%2Fsecurityaffairs.co%2Fwordpress%2Ffeed',
        enabled: true
    },
    {
        link: 'https://api.rss2json.com/v1/api.json?rss_url=http%3A%2F%2Fwww.darkreading.com%2Frss_simple.asp',
        enabled: true
    },
];

$(document).ready(function () {
    getName()
});

function NewsDetail(source, data) {
    this.source = source;
    this.data = data;
}

const cors = "https://cors-anywhere.herokuapp.com/";

$.ajax({
    url: 'https://dailyverses.net/getdailyverse.ashx?language=niv&isdirect=1&url=' + window.location.hostname,
    dataType: 'JSONP',
    success: function (json) {
        $(".dailyVersesWrapper").prepend(json.html);
        localStorage.setItem("previousBibleQuote", json.html)
    },
    error: function (request, status, error) {
        $(".dailyVersesWrapper").prepend(localStorage.getItem("previousBibleQuote"));
    }
});

function getQuote() {
    fetch("http://quotes.rest/qod")
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            //console.log(data);
            const quotesContainter = document.querySelector("#quotes");
            let quote = document.createElement("p");
            quotesContainter.appendChild(quote);
            quote.innerText = data["contents"]["quotes"][0]["quote"];
            let author = document.createElement("p");
            author.id = "author"
            author.innerText = "Author: "
            let authorName = data["contents"]["quotes"][0]["author"];
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

function getTime() {
    let date = new Date();
    let hour = date.getHours();
    let min = date.getMinutes();
    let sec = date.getSeconds();

    min = checkTime(min);
    sec = checkTime(sec);

    let time = document.querySelector("#clock");
    time.textContent = hour + ":" + min + ":" + sec;
    let t = setTimeout(getTime, 500);
}

function checkTime(i) {
    // add zero in front of numbers < 10
    if (i < 10) {
        i = "0" + i
    }
    return i;
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
        if (news !== 'security') {
            $('#title').text('Love for Africa');
        }
        if (news === 'all' || news === 'security') {
            var index;
            for (index in links) {
                fetch(links[index].link)
                    .then(function (response) {
                        return response.json();
                    })
                    .then(function (data) {
                        bindToView(newsContainer, allSources, convertResponse(data));
                    });
            }
        }else{

        switch (news) {
            case 'africa':
                url = 'http://rssmix.com/u/8858077/rss.xml';
                break;
            case 'east-africa':
                url = 'http://rssmix.com/u/8857989/rss.xml';
                break;
            case 'west-africa':
                url = 'http://rssmix.com/u/8858044/rss.xml';
                break;
            case 'central-africa':
                url = 'http://rssmix.com/u/8858047/rss.xml';
                break;
            case 'southern-africa':
                url = 'http://rssmix.com/u/8858058/rss.xml';
                break;
            case 'north-africa':
                url = 'http://rssmix.com/u/8858068/rss.xml';
                break;
            default:
                url = 'http://rssmix.com/u/8858077/rss.xml';
        }

            $.get(cors + url, function (responseText) {
                console.log(responseText);
                var data = xmlToJson(responseText);
                console.log(data)
                bindToView(newsContainer, allSources, convertRssMixResponse(data));
            });
        }
    });
};


function getName() {

    chrome.storage.sync.get({
        username: ''
    }, function (items) {
        const name = items.username;
        if (name != null) {
            const p = document.getElementById("name");
            p.innerText = p.innerText + " " + name;
            document.getElementById("nameInput").style.display = "none";
        } else {
            document.getElementById("nameInput").style.display = "block";
        }
    });


}

$("#nameInput").on('keypress', function (e) {
    if (e.which === 13) {
        localStorage.setItem("name", $("#nameInput").val());
        document.getElementById("nameInput").style.display = "none";
        getName();
    }
});

document.addEventListener("DOMContentLoaded", function () {
    getQuote();
    getTime();
    getNews();
});

/*Helper Functions*/
function classStringGen(string) {
    return string.toLowerCase().replace(' ', '')
}

$("#bg").ripples({
    resolution: 800,
    dropRadius: 20,
    perturbance: 0.02,
    interactive: true,
    crossOrigin: true
});

function convertResponse(data) {
    return new NewsDetail(data.feed.title, data.items);
    ;
}

function convertRssMixResponse(data) {
    return new NewsDetail(data.rss.channel.title, data.rss.channel.item);
    ;
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
    let data = newsDetails.data;

    let length = data.length;
    for (let i = 0; i < length; i++) {
        let newsItem = document.createElement("div");
        newsItem.classList.add("news", "card");
        let title = data[i]["title"]
        let url = data[i]["link"];
        let link = document.createElement("a");
        link.href = url;
        link.innerHTML = title;
        link.rel = "noreferrer noopener"
        link.target = "_blank";
        newsItem.appendChild(link);
        newsContainer.appendChild(newsItem);
    }
}

// improve runtime of this function
function xmlToJson(xml) {
    try {
        var obj = {};
        if (xml.children.length > 0) {
            for (var i = 0; i < xml.children.length; i++) {
                var item = xml.children.item(i);
                var nodeName = item.nodeName;

                if (typeof (obj[nodeName]) == "undefined") {
                    obj[nodeName] = xmlToJson(item);
                } else {
                    if (typeof (obj[nodeName].push) == "undefined") {
                        var old = obj[nodeName];

                        obj[nodeName] = [];
                        obj[nodeName].push(old);
                    }
                    obj[nodeName].push(xmlToJson(item));
                }
            }
        } else {
            obj = xml.textContent;
        }
        return obj;
    } catch (e) {
        console.log(e.message);
    }
}
