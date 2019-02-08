$("#newTab").on("click",function () {
	window.open("chrome://newTab");
});
$("#changeName").on("click",function (){
	localStorage.removeItem("name");
});
