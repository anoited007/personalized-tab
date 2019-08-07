$(document).ready(function () {
	getName()
});

const cors = "https://cors-anywhere.herokuapp.com/";

	$.ajax({
		url: 'https://dailyverses.net/getdailyverse.ashx?language=niv&isdirect=1&url=' + window.location.hostname,
		dataType: 'JSONP',
		success: function (json) {
			$(".dailyVersesWrapper").prepend(json.html);
			localStorage.setItem("previousBibleQuote",json.html)
		},
		error: function (request, status, error) {
			$(".dailyVersesWrapper").prepend(localStorage.getItem("previousBibleQuote"));}
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
			link.target ="_blank"
			let baseURL = "https://www.google.com/search?q="
			link.href = baseURL + encodeURIComponent(authorName);
			link.innerText = authorName ;
			let authorContent = document.createElement("span");
			authorContent.appendChild(link);
			author.appendChild(authorContent);
      quote.appendChild(author);
		});

}

/* function quote(){
  fetch(cors+"https://www.forbes.com/forbesapi/thought/uri.json?enrich=true&query=1&relatedlimit=1")
  .then(function(response){
    return response.json();
  })
  .then(function(data){
    const quotesContainter = document.querySelector("#quotes");
    let quote = data["thought"]["quote"];
    let author = data["author"];
    let msg = document.createElement("p");
    msg.textContent = quote;
    quotesContainter.appendChild(msg);
  })
} */

/*function getBackground() {
	const background = "https://picsum.photos/2048/1365/?random"
	let body = document.querySelector("body");
	if (background !== null || background !== undefined) {
		body.style.backgroundImage = "url(https://picsum.photos/2048/1365/?random)";
	} else {
		body.style.backgroundImage = "url(img/bg01.jpg)";
	}
}*/

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
	if (i < 10) {
		i = "0" + i
	}
	;  // add zero in front of numbers < 10
	return i;
}

function getNews() {
	//Get news container.
	const newsContainer = document.querySelector("#news-container");
	let allSources = document.createElement("ul");
	allSources.setAttribute("class", "allSources");
	//newsContainer.append(allSources);

	fetch("https://api.rss2json.com/v1/api.json?rss_url=http%3A%2F%2Ffeeds.feedburner.com%2Feset%2Fblog")
			.then(function (response) {
				return response.json();
			})
			.then(function (data) {
				let source = document.createElement("p");
				source.classList.add("news-source");
				source.textContent = "We live Security";
				newsContainer.appendChild(source);

				const li = document.createElement('li');
				li.innerText = source.textContent;
				li.setAttribute("class", classStringGen(source.innerText));
				allSources.append(li);

				let length = data["items"].length;
				for (let i = 0; i < length; i++) {
					let newsItem = document.createElement("div");
					newsItem.classList.add("news", "card");
					let title = data["items"][i]["title"]
					let url = data["items"][i]["link"];
					let link = document.createElement("a");
					link.href = url;
					link.innerHTML = title;
					link.rel = "noreferrer noopener"
					link.target = "_blank";
					newsItem.appendChild(link);
					newsContainer.appendChild(newsItem);
				}

			});

	fetch("https://api.rss2json.com/v1/api.json?rss_url=http%3A%2F%2Fsecurityaffairs.co%2Fwordpress%2Ffeed")
			.then(function (response) {
				return response.json();
			})
			.then(function (data) {
				let source = document.createElement("p");
				source.classList.add("news-source");
				source.textContent = "Security Affairs";
				newsContainer.appendChild(source);

				const li = document.createElement('li');
				li.innerText = source.textContent;
				li.setAttribute("class", classStringGen(source.innerText));
				allSources.append(li);

				let length = data["items"].length;
				for (let i = 0; i < length; i++) {
					let newsItem = document.createElement("div");
					newsItem.classList.add("news", "card");
					let title = data["items"][i]["title"]
					let url = data["items"][i]["link"];
					let link = document.createElement("a");
					link.href = url;
					link.innerHTML = title;
					link.rel = "noreferrer noopener"
					link.target = "_blank";
					newsItem.appendChild(link);
					newsContainer.appendChild(newsItem);
				}

			});

	fetch("https://api.rss2json.com/v1/api.json?rss_url=http%3A%2F%2Fwww.darkreading.com%2Frss_simple.asp")
			.then(function (response) {
				return response.json();
			})
			.then(function (data) {
				let source = document.createElement("p");
				source.classList.add("news-source");
				source.textContent = "Dark Reading";
				newsContainer.appendChild(source);

				const li = document.createElement('li');
				li.innerText = source.textContent;
				li.setAttribute("class", classStringGen(source.innerText));
				allSources.append(li);

				let length = data["items"].length;
				for (let i = 0; i < length; i++) {
					let newsItem = document.createElement("div");
					newsItem.classList.add("news", "card");
					let title = data["items"][i]["title"]
					let url = data["items"][i]["link"];
					let link = document.createElement("a");
					link.href = url;
					link.innerHTML = title;
					link.rel = "noreferrer noopener"
					link.target = "_blank";
					newsItem.appendChild(link);
					newsContainer.appendChild(newsItem);
				}

			});
}


function getName() {
	const name = localStorage.getItem("name");

	if (name != null) {
		const p = document.getElementById("name");
		p.innerText = p.innerText + " " + name;
		document.getElementById("nameInput").style.display = "none";
	} else {
		document.getElementById("nameInput").style.display = "block";
	}
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
