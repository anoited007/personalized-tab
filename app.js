

function getQuote(){
//  fetch("http://quotes.rest/qod.json?category=management")
  fetch("http://localhost/extension/test.json", {mode:'no-cors'})
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

function test(){
  fetch("https://bit.ly/2AlayQb", {mode:'no-cors'})
  .then(function(response){
   return response.json();
   })
   .then(function(data){

     console.log(data);
  });
}
getQuote();
getBackground();
getTime();
//getNews();
test();
