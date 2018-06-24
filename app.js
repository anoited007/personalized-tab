//"use strict";
var quotesContainter = document.querySelector("#quotes");

/*var request = new XMLHttpRequest();

// Open a new connection, using the GET request on the URL endpoint
//request.open('GET', 'http://quotes.rest/qod.json?category=management', true);

request.open('GET', 'http://localhost/extension/test.json', true);
request.responseType = "json"

//let data = JSON.parse(this.request);
request.onload = function () {
  // Begin accessing JSON data here
  if (request.status >= 200 && request.status < 400) {
  //  let quote = data.contents.quotes[quote];
  let quote = request.response;
    quotesContainter.innerText = quote;
  }
  request.send();
}*/


//fetch("http://quotes.rest/qod.json?category=management")
fetch("http://localhost/extension/test.json", {mode:'no-cors'})
.then(function(response){

  quotesContainter.innerText = response.json();
});
