

function getQuote(){
  fetch("http://quotes.rest/qod.json?category=management")
  //fetch("http://localhost/extension/test.json", {mode:'no-cors'})
  .then(function(response){
   return response.json();
   })
   .then(function(data){
     //get background url
     var background = data["contents"]["quotes"][0]["background"];
    // console.log("logging for Fetch");
    // console.log(data);
    // console.log(data["contents"]["quotes"][0]);
     const quotesContainter = document.querySelector("#quotes");
     let quote = document.createElement("p");
     quotesContainter.appendChild(quote);
    quote.innerText = data["contents"]["quotes"][0]["quote"];
  //  console.log(data["contents"]["quotes"][0]["background"])
  });

}

function getBackground(background){
  let container = document.querySelector("#container");
  if(background){
    container.style.backgroundImage = "url(background)";
  }
  else{
    container.style.backgroundImage = "url(img/bg01.jpg)";
  }
}

function getTime(){
  let date = new Date();
  let time = document.createElement("p");
  let timeContainer = document.querySelector("#time");
  timeContainer.appendChild(time);
  time.innnerText = "Time should show here";// date.toLocaleTimeString();
  //console.log(date.toLocaleTimeString());
}

/*function getNews(){
  var request = new XMLHttpRequest();
  request.open('GET', 'http://localhost/extension/rss.xml', true);
  request.onload(function(response){
    if(request.status === 200){
      var data = response
      request.send();
      console.log(data);
    }
    else{
      console.log("Error getting data");
    }

});
}*/

function getNews(){
  //Get news container.
  const newsContainer = document.querySelector("#news-container");

  fetch("https://api.rss2json.com/v1/api.json?rss_url=http%3A%2F%2Ffeeds.feedburner.com%2Feset%2Fblog")
   .then(function(response){
     return response.json();
   })
  .then(function(data){

    let source = document.createElement("p");
    source.classList.add("news-source");
    source.innnerText = "We live Security";
    newsContainer.appendChild(source);

    let length = data["items"].length;
    for(let i=0; i<length; i++){
      let newsItem = document.createElement("div");
      newsItem.classList.add("news");
      let title =  data["items"][i]["title"]
      let url = data["items"][i]["link"];
      let link = document.createElement("a");
      link.href = url;
      link.innerHTML = title;
      link.target = "_blank";
      newsItem.appendChild(link);
      newsContainer.appendChild(newsItem);
    }

  });

  fetch("https://api.rss2json.com/v1/api.json?rss_url=http%3A%2F%2Fsecurityaffairs.co%2Fwordpress%2Ffeed")
   .then(function(response){
     return response.json();
   })
  .then(function(data){
        let source = document.createElement("p");
        source.classList.add("news-source");
        source.innnerText = "Security Affairs";
        newsContainer.appendChild(source);

        let length = data["items"].length;
        for(let i=0; i<length; i++){
          let newsItem = document.createElement("div");
          newsItem.classList.add("news");
          let title =  data["items"][i]["title"]
          let url = data["items"][i]["link"];
          let link = document.createElement("a");
          link.href = url;
          link.innerHTML = title;
          link.target = "_blank";
          newsItem.appendChild(link);
          newsContainer.appendChild(newsItem);
        }

  });

  fetch("https://api.rss2json.com/v1/api.json?rss_url=http%3A%2F%2Fwww.darkreading.com%2Frss_simple.asp")
   .then(function(response){
     return response.json();
   })
  .then(function(data){
    let source = document.createElement("p");
    source.classList.add("news-source");
    source.innnerText = "Dark Reading";
    newsContainer.appendChild(source);

    let length = data["items"].length;
    for(let i=0; i<length; i++){
      let newsItem = document.createElement("div");
      newsItem.classList.add("news");
      let title =  data["items"][i]["title"]
      let url = data["items"][i]["link"];
      let link = document.createElement("a");
      link.href = url;
      link.innerHTML = title;
      link.target = "_blank";
      newsItem.appendChild(link);
      newsContainer.appendChild(newsItem);
    }

  });
}
getQuote();
getBackground();
getTime();
getNews();
