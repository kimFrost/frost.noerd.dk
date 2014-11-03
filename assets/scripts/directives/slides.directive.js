

(function (undefiend) {
	'use strict';

	angular
		.module('NoerdDk')
		.directive('slides', lightbox);
	
	/* @ngInject */
	function lightbox($timeout) {
		var directive = {
			replace: true,
			//templateUrl: '/templates/lightbox.html',
			link: link,
			scope: {
				slides: '&'
			},
			restrict: 'A',
			controller: directiveController
		};
		
		/* @ngInject */
		function directiveController($scope) {

				$scope.slides = {
					options: {
						loop: false,
						autoplay: false,
						autoplaytime: 5000,
						boxAnimationTime: 300,
						swipeMinTime: 50,
						swipeMaxTime: 200,
						swipeMinDistance: 100,
						swipeMaxDistance: 900,
						clickPreventTime: 100
					},
					autoplay: null,
					currentIndex: 0,
					timer: null,
					states: {
						show: false,
						boxAnimating: false,
						slideAnimating: false
					},
					temp: {
						baseTime: null,
						basePointX: null,
						baseX: null,
						allowClick: true,
						lastTouchClientX: null
					},
					css: {}
				};

				$scope.slides.checkActive = function(id) {
					if (id !== undefined) {
						if (id === $scope.slides.currentIndex) {
							return true;
						}
						else {
							return false;
						}
					}
				};

				$scope.slides.setAutoPlay = function(direction) {
					direction = (direction === undefined) ? 1 : direction;
					if ($scope.slides.autoplay) {
						$scope.slides.timer = $timeout(function(){
							$scope.slides.switchSlide(direction);
						},$scope.slides.options.autoplaytime);
					}
				};

				$scope.slides.switchSlide = function(direction, jump) {
					direction = (direction === undefined) ? 1 : direction;
					jump = (jump === undefined) ? false : jump;
					$timeout.cancel($scope.slides.timer);
					var activeIndex = $scope.slides.currentIndex;
					var newActiveIndex;
					if (jump) {
						newActiveIndex = direction;
					}
					else {
						if ($scope.slides.options.loop) {
							newActiveIndex = (activeIndex + direction) % $scope.slidesLength;
						}
						else {
							newActiveIndex = activeIndex + direction;
							if (newActiveIndex > ($scope.slidesLength - 1)) {
								newActiveIndex = $scope.slidesLength - 1;
							}
						}
					}
					if (newActiveIndex < 0) {
						if ($scope.slides.options.loop) {
							newActiveIndex = Math.abs($scope.slidesLength + newActiveIndex);
						}
						else {
							newActiveIndex = 0;
						}
					}
					$scope.slides.currentIndex = newActiveIndex;
					$scope.slides.setAutoPlay(direction);
				};

			}
		return directive;

		function link(scope, element, attrs) {

			// Scope Bindings
			scope.$watch('slides', function(oldval, newval) {
				scope.slides.currentIndex = 0;
			}, true);

			scope.$on('lightbox:open', function() {
				//console.info('lightbox:open');
				scope.slides.open();
			});

			scope.$on('lightbox:close', function() {
				//console.info('lightbox:close');
				scope.slides.close();
			});

			// Input Bindings


			// Bind mouse down
			element.bind('mousedown touchstart', function(event) {
				var baseX = 0;
				if (event.touches !== undefiend) {
					baseX = event.touches[0].clientX;
				}
				else {
					baseX = event.clientX;
				}
				scope.slides.temp.baseTime = Date.now();
				scope.slides.temp.baseX = baseX;
				scope.slides.temp.basePointX = baseX;
				scope.slides.states.moveListen = true;
				//$scope.$apply();
			});

			// Bind mouse Up and Leave
			element.bind('mouseup mouseleave touchend', function(event) {
				//scope.slides.states.noAnimate = false;
				//scope.slides.states.moveListen = false;
				var x = 0;
				if (event.changedTouches !== undefiend) {
					x = event.changedTouches[0].clientX;
				}
				else {
					x = event.clientX;
				}
				var timeDiff = Date.now() - scope.slides.temp.baseTime;
				var xDistance = x - scope.slides.temp.basePointX;
				var direction = 1;
				if (xDistance > 0) {
					direction = -1;
				}
				xDistance = Math.abs(xDistance);
				// Check for swipe
				if (timeDiff > scope.slides.options.swipeMinTime &&
					timeDiff < scope.slides.options.swipeMaxTime &&
					xDistance < scope.slides.options.swipeMaxDistance &&
					xDistance > scope.slides.options.swipeMinDistance
					) {
					//console.info('swipe');
					//scope.slides.temp.allowClick = false;
					scope.slides.switchSlide(direction);
				}
				else if (xDistance === 0) {
					// Didn't move cursor, therefore a single click
					scope.slides.temp.allowClick = true;
				}
				else {
					scope.slides.temp.allowClick = false;
					//recalPos();
				}
				scope.$apply();
			});

			element.bind('mousemove touchmove', function(event) {
				event.preventDefault();
			});



		}
	}
})();



/*
angular.module('lysApp').directive('slides', function() {
	return function(scope, element, attrs) {
		setTimeout(function() {
			scope.$apply(attrs.slides);
		},0);

		scope.$watch('slides', function(oldval, newval) {

		});
	};
});
*/