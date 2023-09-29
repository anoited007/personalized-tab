
$(function () {
	$("#newTab").on("click",function (e) {
		chrome.tabs.create({url:"chrome://newTab"});
	});

	$("#changeName").on("click",function (){
		localStorage.removeItem("name");
	});
});
