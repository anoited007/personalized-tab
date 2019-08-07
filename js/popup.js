
$(function () {
	$("#newTab").on("click",function (e) {
		chrome.tabs.create({url:"chrome://newTab"});
	});

	$("#changeName").on("click",function (){
		localStorage.removeItem("name");
	});

})

document.querySelector('#go-to-options').addEventListener(function() {
	if (chrome.runtime.openOptionsPage) {
		chrome.runtime.openOptionsPage();
	} else {
		window.open(chrome.runtime.getURL('options.html'));
	}
});
