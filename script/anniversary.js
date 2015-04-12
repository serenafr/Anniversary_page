var intervalID;

function getCurrentAndNext() {
	var currentIndex;
	var pics = document.getElementsByClassName("pic");
	for (var i = 0; i < pics.length; i++) {
		if (pics[i].style.display != 'none') {
			currentIndex = i;
			break;
		}
	}
	var nextIndex = Math.floor(Math.random() * (pics.length - 1));
	if (nextIndex >= currentIndex) {
		nextIndex++;
	}
	return {
		currentPic: pics[currentIndex], 
		nextPic: pics[nextIndex]
	};
}

function playNext() {
	var twoPics = getCurrentAndNext();
	twoPics.currentPic.style.display = 'none';
	twoPics.nextPic.style.display = '';
}

function play() {
	var animations = [
		animationLeft, 
		animationRight, 
		animationUp, 
		animationDown, 
		composite(animationUp, animationRight), 
		composite(animationUp, animationLeft), 
		composite(animationDown, animationRight), 
		composite(animationDown, animationLeft), 
		animationOpacity];
	function easeInOutCubic(x) {
		if (x < 0.5) {
			return 4 * x * x * x;
		} else {
			return -4 * (1 - x) * (1 - x) * (1 - x) + 1;
		}
	}
	function easeOutCubic(x) {
		return 1 - (1 - x) * (1 - x) * (1 - x);
	}
	if (intervalID == undefined) {
		intervalID = setInterval(function() {
			var animationIndex = Math.floor(Math.random() * animations.length);
			animation(animations[animationIndex], easeOutCubic);
		}, 3000);
	}	
}

function pause() {
	clearInterval(intervalID);
	intervalID = undefined;
}

function reSizeImgs() {
	var pics = document.getElementsByClassName("pic");
	var screenWidth = window.innerWidth;
	var screenHeight = window.innerHeight;
	for (var i = 0; i < pics.length; i++) {
		var picWidth = pics[i].width;
		var picHeight = pics[i].height;
		var widthScale = screenWidth / picWidth;
		var heightScale = screenHeight / picHeight;
		var scale = Math.max(widthScale, heightScale);
		var scaleWidth = scale * picWidth;
		var scaleHeight = scale * picHeight;
		var left = (screenWidth - scaleWidth) / 2;
		var top = (screenHeight - scaleHeight) / 2 ;
		pics[i].style.width = scaleWidth + 'px';
		pics[i].style.height = scaleHeight + 'px';
		pics[i].style.left = left + 'px';
		pics[i].style.top = top + 'px';
	}
}

function getCurrentValue(startValue, startTime, currentTime, duration, endValue, interpolateFunc) {
	var progress = (currentTime - startTime) / duration;
	if (progress < 0) {
		progress = 0;
	}
	if (progress > 1) {
		progress = 1;
	}
	interpolateFunc = interpolateFunc || function (x) { return x; };
	var interpolateRatio = interpolateFunc(progress);
	return (endValue - startValue) * interpolateRatio + startValue;
}

function animation(updateFunc, animationSpeedFunc) {
	var twoPics = getCurrentAndNext();
	var startTime = new Date().getTime();
	var duration = 1000;
	updateFunc(twoPics.nextPic, startTime, duration, animationSpeedFunc);
	twoPics.nextPic.style.display = '';
	twoPics.currentPic.style.zIndex = -2;
	twoPics.nextPic.style.zIndex = -1;
	var animationID = setInterval(
		function() {
			if(!updateFunc(twoPics.nextPic, startTime, duration, animationSpeedFunc)) {
				clearInterval(animationID);
				twoPics.currentPic.style.display = 'none';
			}
		}, 20);
}

function animationLeft(pic, startTime, duration, animationSpeedFunc) {
	var startValue = window.innerWidth;
	var endValue = (window.innerWidth - pic.width) / 2;
	var currentTime = new Date().getTime();
	var currentValue = getCurrentValue(startValue, startTime, currentTime, duration, endValue, animationSpeedFunc);
	pic.style.left = currentValue + 'px';
	return currentTime - startTime < duration;
}

function animationRight(pic, startTime, duration, animationSpeedFunc) {
	var startValue = 0 - pic.width;
	var endValue = (window.innerWidth - pic.width) / 2;
	var currentTime = new Date().getTime();	
	var currentValue = getCurrentValue(startValue, startTime, currentTime, duration, endValue, animationSpeedFunc);
	pic.style.left = currentValue + 'px';
	return currentTime - startTime < duration;
}

//Play an image from bottom to top.
function animationUp(pic, startTime, duration, animationSpeedFunc) {
	var startValue = window.innerHeight;
	var endValue = (window.innerHeight - pic.height) / 2;
	var currentTime = new Date().getTime();
	var currentValue = getCurrentValue(startValue, startTime, currentTime, duration, endValue, animationSpeedFunc);
	pic.style.top = currentValue + 'px';
	return currentTime - startTime < duration;
 }

//Play an image from top to bottom.
function animationDown(pic, startTime, duration, animationSpeedFunc) {
	var startValue = 0 - pic.height;
	var endValue = (window.innerHeight - pic.height) / 2;
	var currentTime = new Date().getTime();
	var currentValue = getCurrentValue(startValue, startTime, currentTime, duration, endValue, animationSpeedFunc);
	pic.style.top = currentValue + 'px';
	return currentTime - startTime < duration;
}

function composite(func1, func2) {
	return function(pic, startTime, duration, animationSpeedFunc) {
		func1(pic, startTime, duration, animationSpeedFunc);
		return func2(pic, startTime, duration, animationSpeedFunc);
	}
}

function animationOpacity(pic, startTime, duration, animationSpeedFunc) {
 	var startValue = 0;
 	var endValue = 1;
 	var currentTime = new Date().getTime();
 	var currentValue = getCurrentValue(startValue, startTime, currentTime, duration, endValue, animationSpeedFunc);
 	pic.style.opacity = currentValue;
 	return currentTime - startTime < duration;
 }