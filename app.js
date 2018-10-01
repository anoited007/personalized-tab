

function getQuote(){
  fetch("http://quotes.rest/qod.json?category=management")
  //fetch("http://localhost/extension/test.json", {mode:'no-cors'})
  .then(function(response){
   return response.json();
   })
   .then(function(data){
     //get background url
     //var background = data["contents"]["quotes"][0]["background"];
     // console.log(background);
    // console.log(data["contents"]["quotes"][0]);
     const quotesContainter = document.querySelector("#quotes");
     let quote = document.createElement("p");
     quotesContainter.appendChild(quote);
    quote.innerText = data["contents"]["quotes"][0]["quote"];
  //  console.log(data["contents"]["quotes"][0]["background"])
  });

}

function getBackground(){
  const background = "https://picsum.photos/2048/1365/?random"
  let body = document.querySelector("body");
  if(background !== null || background !== undefined){
    // TODO: Fix concatination issue with background.
    // body.style.backgroundImage = "url("+background+")";
    body.style.backgroundImage = "url(https://picsum.photos/2048/1365/?random)";
  }
  else{
    body.style.backgroundImage = "url(img/bg01.jpg)";
  }
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
    source.textContent = "We live Security";
    newsContainer.appendChild(source);

    let length = data["items"].length;
    for(let i=0; i<length; i++){
      let newsItem = document.createElement("div");
      newsItem.classList.add("news","card");
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
        source.textContent = "Security Affairs";
        newsContainer.appendChild(source);

        let length = data["items"].length;
        for(let i=0; i<length; i++){
          let newsItem = document.createElement("div");
          newsItem.classList.add("news","card");
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
    source.textContent = "Dark Reading";
    newsContainer.appendChild(source);

    let length = data["items"].length;
    for(let i=0; i<length; i++){
      let newsItem = document.createElement("div");
      newsItem.classList.add("news","card");
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

var todoList = [];

function todo() {
  const addTodo = document.querySelector("#add-todo");
  const todoContainer = document.querySelector("#todo");
  addTodo.addEventListener('keyup', (event) => {
  const keyName = event.key;
  if(keyName === "Enter"){
    //&& value.trim().length > 0
    event.preventDefault();
    let list = document.createElement("div");
    list.classList.add("list");
    let todo = document.createElement("span");
    todo.classList.add("todo");
    todo.innerText = addTodo.value;
    todo.contentEditable = true;
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.onchange = function() {
      if(checkbox.checked){
        checkbox.nextElementSibling.classList.add("done");
      }
      else {
        checkbox.nextElementSibling.classList.remove("done");
      }
    }

    list.appendChild(checkbox);
    list.appendChild(todo);
    todoContainer.appendChild(list);
    todoList.push(list);
    //console.log(todoList);
    addTodo.value = "";
    chrome.storage.sync.set({"todoList":todoList});
     }
  });
}

function getTime(){
  let date = new Date();
  let hour = date.getHours();
  let min = date.getMinutes();
  let sec = date.getSeconds();

  min = checkTime(min);
  sec = checkTime(sec);

  let time = document.querySelector("#clock");
  time.textContent = hour+ ":" +min+ ":" +sec;
  // date.toLocaleTimeString();
  //console.log(date.toLocaleTimeString());
   let t = setTimeout(getTime, 500);
}

function checkTime(i) {
    if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
    return i;
}


todo();
//getQuote();
getTime();
getNews();
