(function (undefined) {
	'use strict';

	// shim layer with setTimeout fallback
	window.requestAnimFrame = (function(){
		return  window.requestAnimationFrame       ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame    ||
			function( callback ){
				window.setTimeout(callback, 1000 / 60);
			};
	})();

	/**
	 * @ngdoc overview
	 * @name frostNoerdDk - SlidesController
	 * @description
	 * # frostNoerdDk
	 *
	 * Main module of the application.
	 */

	angular
		.module('NoerdDk')
		.controller('SlidesCtrl', SlidesCtrl);

	/* @ngInject */
	function SlidesCtrl($scope, $window, $timeout, $element) {
		console.log('SlidesCtrl');

		var slides = this;
		slides.options = {
			debug: true,
			loop: true,
			autoplay: false,
			autoplaytime: 5000,
			boxAnimationTime: 300,
			swipeMinTime: 50,
			swipeMaxTime: 200,
			swipeMinDistance: 100,
			swipeMaxDistance: 900,
			clickPreventTime: 100
		};
		slides.autoplay = null;
		slides.currentIndex = 0;
		slides.numOfSlides = 0;
		slides.timer = null;
		slides.states = {
			show: false,
			boxAnimating: false,
			slideAnimating: false
		};
		slides.temp = {
			baseTime: null,
				basePointX: null,
				baseX: null,
				allowClick: true,
				lastTouchClientX: null
		};
		slides.css = {};

		// Public functions
		slides.switchSlide = switchSlide;
		slides.checkActive = checkActive;

/**---------------------------------------
		FUNCTION LIBRARY
---------------------------------------**/
		// Debug log
		function log(msg1, msg2) {
			msg1 = (msg1 === undefined) ? null : msg1;
			msg2 = (msg2 === undefined) ? null : msg2;
			if (slides.options.debug) {
				if (msg2 !== null) {
					try {
						console.log(msg1, msg2);
					}
					catch(err) {

					}
				}
				else {
					try {
						console.log(msg1);
					}
					catch(err) {

					}
				}
			}
		}
		// Check active
		function checkActive(id) {
			if (id !== undefined) {
				if (id === slides.currentIndex) {
					return true;
				}
				else {
					return false;
				}
			}
		}
		// Set state of autoplay
		function setAutoPlay(direction) {
			direction = (direction === undefined) ? 1 : direction;
			log('setAutoPlay');
			if (slides.options.autoplay) {
				slides.timer = $timeout(function(){
					switchSlide(direction);
				},slides.options.autoplaytime);
			}
		}
		// Switch Slide
		function switchSlide(direction, jump) {
			direction = (direction === undefined) ? 1 : direction;
			jump = (jump === undefined) ? false : jump;
			log('switchSlide', slides);
			$timeout.cancel(slides.timer);
			var activeIndex = slides.currentIndex;
			var newActiveIndex;
			if (jump) {
				newActiveIndex = direction;
			}
			else {
				if (slides.options.loop) {
					newActiveIndex = (activeIndex + direction) % slides.numOfSlides;
				}
				else {
					newActiveIndex = activeIndex + direction;
					if (newActiveIndex > (slides.numOfSlides-1)) {
						newActiveIndex = slides.numOfSlides-1;
					}
				}
			}
			if (newActiveIndex < 0) {
				if (slides.options.loop) {
					newActiveIndex = Math.abs(slides.numOfSlides + newActiveIndex);
				}
				else {
					newActiveIndex = 0;
				}
			}
			slides.currentIndex = newActiveIndex;
			setPos();
			setAutoPlay(direction);
		}
		function setPos() {
			var leftPos = -(slides.currentIndex * 100);
			var css = {
				'-moz-transform': 'translate(' + leftPos +'%, 0%)',
				'-ms-transform': 'translate(' + leftPos +'%, 0%)',
				'-webkit-transform':'translate(' + leftPos +'%, 0%)',
				'transform': 'translate(' + leftPos +'%, 0%)'
			};
			slides.css = css;
		}
/**---------------------------------------
		BINDINGS
---------------------------------------**/
		// Watch slides list count from attribute. Yes, I know its dirty.
		$scope.$watch($element.attr('data-slides'), function(val) {
			slides.numOfSlides = val;
		});
		// Watch slides autoplay state from attribute. Yes, I know its dirty.
		$scope.$watch($element.attr('data-slides-autoplay'), function(val) {
			slides.options.autoplay = val;
			setAutoPlay();
		});

	}
})();