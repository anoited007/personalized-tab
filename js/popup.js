
$(function () {
	$("#newTab").on("click",function (e) {
		chrome.tabs.create({url:"chrome://newTab"});
		//window.open("chrome://newTab");
		console.log(e);
	});

	$("#changeName").on("click",function (){
		localStorage.removeItem("name");
	});

})
