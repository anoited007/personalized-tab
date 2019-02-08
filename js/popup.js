function resetName(){
	console.log("reset called")
	localStorage.removeItem("name");
}

$("#changeName").on("click",resetName());
$("#newTab").on("click",function () {
	chrome.browserAction.onClicked.addListener(function(activeTab)
	{
		var newURL = "";
		chrome.tabs.create({ url: newURL });
	});
});
