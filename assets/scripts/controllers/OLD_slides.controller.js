

(function (undefiend) {
	'use strict';

	// Debug
	//document.ontouchmove = function(event){
	//event.preventDefault();
	//event.stopPropagation();
	//};

	angular
		.module('NoerdDk')
		.controller('SlidesCtrl', slidesCtrl);

	/* @ngInject */
	function slidesCtrl($scope, $timeout, $element, $interval) {

		// Data
		var slides = this;
		slides.options = {
			debug: false,
			autoplay: false,
			numOfItems: 15,
			autoplaytime: 5000,
			loop: false,
			swipeMinTime: 50,
			swipeMaxTime: 200,
			swipeMinDistance: 100,
			swipeMaxDistance: 300,
			clickPreventTime: 100,
			animationTime: 300
		};
		slides.currentIndex = 0;
		slides.timer = null;
		slides.topOffset = 0;
		slides.fps = -1;
		slides.states = {
			hideArrow: false,
			noAnimate: false,
			moveListen: false,
			draw: false
		};
		slides.css = {};
		// Temp stored data for functions for sharing data
		slides.temp = {
			baseTime: null,
			basePointY: null,
			baseY: null,
			allowClick: true,
			lastTouchClientY: null,
			fpsCount: 0
		};

		// Public functions
		slides.switchSlide = switchSlide;slides.switchSlide = switchSlide;
		slides.checkActive = checkActive;
		slides.toggleOverlay = toggleOverlay;


		/** BINDINGS */

		// Watch slides list count from attribute. Yes, I know its dirty.
		$scope.$watch($element.attr('data-slides-length'), function(val) {
			slides.options.numOfItems = val;
		});

		// Bind Keys
		document.onkeydown = function(event) {
			switch(event.which) {
				case 37: // left

					break;
				case 38: // up
					slides.switchSlide(-1, false, true);
					break;
				case 39: // right

					break;
				case 40: // down
					slides.switchSlide(+1, false, true);
					break;
				default: return;
			}
			event.preventDefault();
		};

		// Bind mouse scroll
		$element.bind('mousewheel DOMMouseScroll', function(event) {
			log('mousewheel', (event.wheelDelta || event.detail));
			var direction = event.wheelDelta;
			if (event.wheelDelta === undefiend && event.detail !== undefiend) {
				direction = (event.detail * -1);
			}
			if (direction > 0) {
				slides.switchSlide(-1, false, true);
			}
			else if (direction < 0) {
				slides.switchSlide(1, false, true);
			}
		});



		// Bind mouse down
		$element.bind('mousedown touchstart', function(event) {
			//event.preventDefault();
			//event.stopPropagation();

			//slides.states.noAnimate = true;

			var baseY = 0;
			if (event.touches !== undefiend) {
				baseY = event.touches[0].clientY;
			}
			else {
				baseY = event.clientY;
			}
			log('baseY', baseY);
			slides.temp.baseTime = Date.now();
			slides.temp.baseY = baseY;
			slides.temp.basePointY = baseY;
			//slides.states.moveListen = true;

			$scope.$apply(function() {
				slides.states.noAnimate = true;
				slides.states.moveListen = true;
			});

			/*
			 // Dirty set noAnimate class
			 slides.states.noAnimate = true;
			 slides.states.moveListen = true;
			 var element = document.querySelector('.slides');
			 if (hasClass(element, 'slides--noanimate') !== true) {
			 element.className = element.className + ' slides--noanimate';
			 }
			 */

		});

		// Prevent firefox link drag from blocking script
		$element.bind('dragstart', function(event) {
			event.preventDefault();
		});

		$element.bind('mousemove touchmove', function(event) {
			event.preventDefault();
			if (slides.states.moveListen) {
				var posY = 0;
				if (event.touches !== undefiend) {
					posY = event.touches[0].clientY;
				}
				else {
					posY = event.clientY;
				}
				moveWorld(slides.temp.baseY - posY);
				slides.temp.baseY = posY;
				//$scope.$apply();
			}
		});

		// Bind mouse Up and Leave
		$element.bind('mouseup mouseleave touchend', function (event) {

			slides.states.noAnimate = false;
			slides.states.moveListen = false;

			/*
			 // Dirty set noAnimate class
			 var element = document.querySelector('.slides');
			 if (hasClass(element, 'slides--noanimate')) {
			 element.className = element.className.replace('slides--noanimate', '');
			 }
			 */

			//$scope.$apply(); // There is a bug where on the second animation will snap instead of animate. No idea why. But this prevents it.
			var y = 0;
			if (event.changedTouches !== undefiend) {
				y = event.changedTouches[0].clientY;
			}
			else {
				y = event.clientY;
			}
			var timeDiff = Date.now() - slides.temp.baseTime;
			var yDistance = y - slides.temp.basePointY;
			var direction = 1;
			if (yDistance > 0) {
				direction = -1;
			}
			yDistance = Math.abs(yDistance);
			log('v---------GROUP----------v');
			log('y', y);
			log('timeDiff', timeDiff);
			log('yDistance', yDistance);
			log('direction', direction);
			log('slides.states.noAnimate', slides.states.noAnimate);
			// Check for swipe
			if (timeDiff > slides.options.swipeMinTime &&
				timeDiff < slides.options.swipeMaxTime &&
				yDistance < slides.options.swipeMaxDistance &&
				yDistance > slides.options.swipeMinDistance
				) {
				log('swipe');
				slides.temp.allowClick = false;
				slides.switchSlide(direction);
			}
			else if (yDistance === 0) {
				// Didn't move cursor, therefore a single click
				slides.temp.allowClick = true;

			}
			else {
				slides.temp.allowClick = false;
				log('recal');

				recalPos();
			}

			$scope.$apply();

			//$scope.$apply();
			//return false;
		});

		$element.bind('click touchend', function(event) {
			log('-->click');
			if (!slides.temp.allowClick) {
				log('Prevent Click');
				event.preventDefault();
				event.stopPropagation();
			}
		});

		// Scope events
		$scope.$on('slides:setSpread', function(event, obj) {
			obj = (obj === undefiend) ? {} : obj;
			log('slides:setSpread', obj.index);
			var animate = true;
			if (obj.animate !== undefined) {
				animate = obj.animate;
			}
			slides.switchSlide(obj.index, true, animate);
		});


		/** INITIATE */
		setAutoPlay();
		drawLoop();


		/** FUNCTION LIBRARY */

		function toggleOverlay(action) {
			if (slides.temp.allowClick) {
				action = (action === undefiend) ? 'closeall' : action;
				$scope.$emit('catalog:toggleOverlay', action);
			}
		}

		// Debug
		function log(msg1, msg2) {
			msg1 = (msg1 === undefiend) ? null : msg1;
			msg2 = (msg2 === undefiend) ? null : msg2;
			if (slides.options.debug) {
				if (msg2 !== null) {
					console.info(msg1, msg2);
				}
				else {
					console.info(msg1);
				}
			}
		}

		function hasClass(element, cls) {
			return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
		}

		// Check Active
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


		// Switch Slide
		function switchSlide(direction, jump, animate) {
			var height = 605; // Temp
			direction = (direction === undefined) ? 1 : direction;
			jump = (jump === undefined) ? false : jump;
			animate = (animate === undefined) ? true : animate;
			$timeout.cancel(slides.timer);
			var activeIndex = slides.currentIndex;
			var newActiveIndex;
			// Set noAnimate state
			slides.states.noAnimate = !animate;
			if (jump) {
				newActiveIndex = direction;
				// To prevent autoplay from jumping the same amount on next switch
				if (direction > 0) {
					direction = 1;
				}
				else {
					direction = -1;
				}
			}
			else {
				if (slides.options.loop) {
					newActiveIndex = (activeIndex + direction) % slides.options.numOfItems;
				}
				else {
					newActiveIndex = activeIndex + direction;
					if (newActiveIndex > (slides.options.numOfItems-1)) {
						newActiveIndex = slides.options.numOfItems-1;
					}
				}
			}
			if (newActiveIndex < 0) {
				if (slides.options.loop) {
					newActiveIndex = Math.abs(slides.options.numOfItems + newActiveIndex);
				}
				else {
					newActiveIndex = 0;
				}
			}
			slides.currentIndex = newActiveIndex;
			slides.topOffset = -(slides.currentIndex * height);

			log('slides.currentIndex', slides.currentIndex);
			log('slides.topOffset', slides.topOffset);

			updatePos();
			setAutoPlay(direction);

			/*
			 if (window.ga !== undefined) {
			 window.ga('send', 'event', {
			 'eventCategory': 'Slides',
			 'eventAction': 'switchSlide',
			 'eventLabel' : 'Index: ' +slides.currentIndex,
			 'eventValue': 1
			 }, {'nonInteraction': 1});
			 }
			 */

			if (slides.states.noAnimate) {
				$scope.$emit('catalog:slideChange', slides.currentIndex);
			}
			else {
				$timeout(function(){
					$scope.$emit('catalog:slideChange', slides.currentIndex);
				},slides.options.animationTime);
			}

		}

		// Set Auto Play
		function setAutoPlay(direction) {
			direction = (direction === undefined) ? 1 : direction;
			if (slides.options.autoplay) {
				slides.timer = $timeout(function(){
					slides.switchSlide(direction);
				}, slides.options.autoplaytime + 10);
			}
		}

		function recalPos() {
			log('recalPos()');
			var height = 605; // Temp
			// Find the nearest slide slot to slide slot to
			var newIndex = Math.round(slides.topOffset / height);
			if (newIndex > 0) {
				newIndex = 0;
			}
			if (newIndex < -(slides.options.numOfItems - 1)) {
				newIndex = (slides.options.numOfItems - 1);
			}
			newIndex = Math.abs(newIndex);
			log('newIndex', newIndex);
			switchSlide(newIndex, true);

			//
			//var value = height * slides.currentIndex;
			//value = -value;
			//value = value + 'px';
		}

		function updatePos() {
			slides.states.draw = true;

		}

		function moveWorld(moveY) {
			//log('moveWorld moveY', moveY);
			slides.topOffset -= moveY;
			updatePos();
		}

		function drawLoop() {
			window.requestAnimFrame(drawLoop);
			draw();
			slides.temp.fpsCount++;
		}


		function draw() {
			if (slides.states.draw) {

				//$element[0].querySelectorAll('.slides__list').style.webkitTransform;
				//$element[0].querySelectorAll('.slides__list').style.webkitTransform.translateY(slides.topOffset +'px');
				var element = document.querySelector('.slides__list');
				element.style.webkitTransform = 'translateY('+slides.topOffset+'px)';
				element.style.MozTransform = 'translateY('+slides.topOffset+'px)';
				element.style.msTransform = 'translateY('+slides.topOffset+'px)';
				element.style.OTransform = 'translateY('+slides.topOffset+'px)';
				element.style.transform = 'translateY('+slides.topOffset+'px)';
				slides.states.draw = false;

				//element.style.webkitTransform.translateY(slides.topOffset +'px');

				//element.style.translateY(slides.topOffset +'px');


				/*
				 var css = {
				 '-moz-transform': 'translate(0px,' + slides.topOffset +'px)',
				 '-ms-transform': 'translate(0px,' + slides.topOffset +'px)',
				 '-webkit-transform':'translate(0px,' + slides.topOffset +'px)',
				 'transform': 'translate(0px,' + slides.topOffset +'px)'
				 };
				 slides.css = css;
				 slides.states.draw = false;
				 $scope.$apply();
				 */

			}
		}

		$interval(function(){
			slides.fps = slides.temp.fpsCount;
			slides.temp.fpsCount = 0;
		}, 1000);

	}
})();