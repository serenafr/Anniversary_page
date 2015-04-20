var intervalID; //The ID that records images playing
var textIntervalId;
var currentImageIndex;
var pics;
var currentTextIndex;
var texts;

function randomShuffle(array) {
	var tmpValue, randomIndex;
	for (var i = array.length - 1; i > 0; i--) {
		randomIndex = Math.floor(Math.random() * (i + 1));
		tmpValue = array[i];
		array[i] = array[randomIndex];
		array[randomIndex] = tmpValue;
	}
}

function getCurrentAndNext() {
	var currentPic;
	if (!pics) {
		pics = Array.prototype.slice.call(document.getElementsByClassName("pic"), 0);
		randomShuffle(pics);
		for (var i = 0; i < pics.length; i++) {
			if (pics[i].style.display != 'none') {
				currentImageIndex = i;
				break;
			}
		}
	}
	currentPic = pics[currentImageIndex];
	var nextImageIndex = currentImageIndex + 1;
	if (nextImageIndex == pics.length) {
		randomShuffle(pics);
		nextImageIndex = 0;
	}
	currentImageIndex = nextImageIndex;
	return {
		currentPic: currentPic, 
		nextPic: pics[nextImageIndex]
	};
}

function playNext() {
	var twoPics = getCurrentAndNext();
	twoPics.currentPic.style.display = 'none';
	twoPics.nextPic.style.display = '';
}

//defines the speed of animation
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
	//autoplay images
	if (intervalID == undefined) {
		intervalID = setInterval(function() {
			var animationIndex = Math.floor(Math.random() * animations.length);
			animation(animations[animationIndex], easeOutCubic);
			playNextTexts();
		}, 8000);
	}	
}

function pause() {
	clearInterval(intervalID);
	intervalID = undefined;
	clearInterval(textIntervalId);
	textIntervalId = undefined;
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
	var duration = 2000;
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

function getCurrentAndNextText() {
	var nextTextIndex;
	var currentText;
	if (!texts) {
		texts = Array.prototype.slice.call(document.getElementsByClassName("text"));
		randomShuffle(texts);
		for (var i = 0; i < texts.length; i++) {
			if (texts[i].style.display != 'none') {
				currentTextIndex = i;
				break;
			}
		}
	} 
	currentText = texts[currentTextIndex];
	nextTextIndex = currentTextIndex + 1;
 	if (nextTextIndex == texts.length) {
 		nextTextIndex = 0;
 		randomShuffle(texts);
 		if (texts[nextTextIndex] == currentText) {
 			nextTextIndex++;
 		}
 	}
 	currentTextIndex = nextTextIndex;
	return {
		currentText: currentText, 
		nextText: texts[nextTextIndex]
	};
}

//The Animation result of current text fade out and next text fade in
function playNextTexts() {
	var twoTexts = getCurrentAndNextText();
	var fadeOutDuration = 2000;
	var startFadeOutTime = new Date().getTime();
	var textFadeOutIntervalId = setInterval(function() {
		textFadeOutAnimation(twoTexts.currentText, fadeOutDuration, startFadeOutTime);
		if (twoTexts.currentText.style.opacity === '0') {
			twoTexts.currentText.style.display = 'none';
			clearInterval(textFadeOutIntervalId);
		} 
	}, 20);
	setTimeout(function() {
		textFadeIn(twoTexts.nextText);
	}, 1000);
}

function textFadeIn(txt) {
	var startFadeInTime = new Date().getTime();
	var fadeInDuration = 2000;
	txt.style.display = '';
	txt.style.opacity = '0';
	var textFadeInInteralId = setInterval(function() {
		textFadeInAnimation(txt, fadeInDuration, startFadeInTime);
		if (txt.style.opacity === '1') {
			clearInterval(textFadeInInteralId);
		}
	}, 20);
}

function textFadeOutAnimation(txt, duration, startTime) {
	var currentTime = new Date().getTime();
	txt.style.opacity = getCurrentValue(1 /* startValue */, startTime, currentTime, duration, 0 /* endValue */, easeOutCubic);
}

function textFadeInAnimation(txt, duration, startTime, endTime) {
	var currentTime = new Date().getTime();
	txt.style.opacity = getCurrentValue(0 /* startValue */, startTime, currentTime, duration, 1 /* endValue */, easeOutCubic);
}
