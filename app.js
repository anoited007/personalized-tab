const container = document.querySelector("#container");

/*
var request = new XMLHttpRequest();

// Open a new connection, using the GET request on the URL endpoint
//request.open('GET', 'http://quotes.rest/qod.json?category=management', true);

request.open('GET', 'http://localhost/extension/test.json', true);
request.responseType = "json"

let data = this.request;
request.onload = function () {
  // Begin accessing JSON data here
  if (request.status >= 200 && request.status < 400) {
  //  let quote = data.contents.quotes[quote];
  let quote = request.response;
  console.log("logging for XMLHttpRequest");
  console.log(quote);
    quotesContainter.innerText = quote;
  }
  request.send();
}*/


//fetch("http://quotes.rest/qod.json?category=management")
fetch("http://localhost/extension/test.json", {mode:'no-cors'})
.then(function(response){
 return response.json();
 })
 .then(function(data){
   console.log("logging for Fetch");
   console.log(data);
   console.log(data["contents"]["quotes"][0]);
   const quotesContainter = document.querySelector("#quotes");
   let quote = document.createElement("p");
   quotesContainter.appendChild(quote);
  quote.innerText = data["contents"]["quotes"][0]["quote"];
  console.log(data["contents"]["quotes"][0]["background"])
});
