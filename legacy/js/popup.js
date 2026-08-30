
$(function () {
	$("#newTab").on("click",function (e) {
		chrome.tabs.create({url:"chrome://newTab"});
	});
});
