$("#newTab").on("click",function () {
	window.open("chrome://newTab","_blank");
});
$("#changeName").on("click",function (){
	localStorage.removeItem("name");
});
