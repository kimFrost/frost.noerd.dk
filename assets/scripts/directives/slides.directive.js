

(function (undefiend) {
	'use strict';

	angular
		.module('lysApp')
		.directive('lightbox', lightbox);
	
	/* @ngInject */
	function lightbox($timeout) {
		var directive = {
			replace: true,
			templateUrl: '/templates/lightbox.html',
			link: link,
			scope: {
				lightboxItems: '='
			},
			restrict: 'A',
			controller: directiveController
		};
		
		/* @ngInject */
		function directiveController($scope) {

				$scope.lightbox = {
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


				$scope.lightbox.open = function() {
					// Start autoplay if option is set to
					$scope.lightbox.autoplay = $scope.lightbox.options.autoplay;
					$scope.lightbox.states.show = true;
					$scope.lightbox.states.boxAnimating = true;
					$scope.lightbox.setAutoPlay();
					$timeout(function() {
						$scope.lightbox.states.boxAnimating = false;
					},$scope.lightbox.options.boxAnimationTime);
				};

				$scope.lightbox.close = function() {
					// Stop autoplay
					$scope.lightbox.autoplay = false;
					$scope.lightbox.states.show = false;
					$scope.lightbox.states.boxAnimating = true;
					$timeout(function() {
						$scope.lightbox.states.boxAnimating = false;
					},$scope.lightbox.options.boxAnimationTime);
				};

				$scope.lightbox.checkActive = function(id) {
					if (id !== undefined) {
						if (id === $scope.lightbox.currentIndex) {
							return true;
						}
						else {
							return false;
						}
					}
				};

				$scope.lightbox.setAutoPlay = function(direction) {
					direction = (direction === undefined) ? 1 : direction;
					if ($scope.lightbox.autoplay) {
						$scope.lightbox.timer = $timeout(function(){
							$scope.lightbox.switchSlide(direction);
						},$scope.lightbox.options.autoplaytime);
					}
				};

				$scope.lightbox.switchSlide = function(direction, jump) {
					direction = (direction === undefined) ? 1 : direction;
					jump = (jump === undefined) ? false : jump;
					$timeout.cancel($scope.lightbox.timer);
					var activeIndex = $scope.lightbox.currentIndex;
					var newActiveIndex;
					if (jump) {
						newActiveIndex = direction;
					}
					else {
						if ($scope.lightbox.options.loop) {
							newActiveIndex = (activeIndex + direction) % $scope.lightboxItems.length;
						}
						else {
							newActiveIndex = activeIndex + direction;
							if (newActiveIndex > ($scope.lightboxItems.length-1)) {
								newActiveIndex = $scope.lightboxItems.length-1;
							}
						}
					}
					if (newActiveIndex < 0) {
						if ($scope.lightbox.options.loop) {
							newActiveIndex = Math.abs($scope.lightboxItems.length + newActiveIndex);
						}
						else {
							newActiveIndex = 0;
						}
					}
					$scope.lightbox.currentIndex = newActiveIndex;
					$scope.lightbox.setAutoPlay(direction);
				};

			}
		return directive;

		function link(scope, element, attrs) {

			// Scope Bindings
			scope.$watch('lightboxItems', function(oldval, newval) {
				scope.lightbox.currentIndex = 0;
			}, true);

			scope.$on('lightbox:open', function() {
				//console.info('lightbox:open');
				scope.lightbox.open();
			});

			scope.$on('lightbox:close', function() {
				//console.info('lightbox:close');
				scope.lightbox.close();
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
				scope.lightbox.temp.baseTime = Date.now();
				scope.lightbox.temp.baseX = baseX;
				scope.lightbox.temp.basePointX = baseX;
				scope.lightbox.states.moveListen = true;
				//$scope.$apply();
			});

			// Bind mouse Up and Leave
			element.bind('mouseup mouseleave touchend', function(event) {
				//scope.lightbox.states.noAnimate = false;
				//scope.lightbox.states.moveListen = false;
				var x = 0;
				if (event.changedTouches !== undefiend) {
					x = event.changedTouches[0].clientX;
				}
				else {
					x = event.clientX;
				}
				var timeDiff = Date.now() - scope.lightbox.temp.baseTime;
				var xDistance = x - scope.lightbox.temp.basePointX;
				var direction = 1;
				if (xDistance > 0) {
					direction = -1;
				}
				xDistance = Math.abs(xDistance);
				// Check for swipe
				if (timeDiff > scope.lightbox.options.swipeMinTime &&
					timeDiff < scope.lightbox.options.swipeMaxTime &&
					xDistance < scope.lightbox.options.swipeMaxDistance &&
					xDistance > scope.lightbox.options.swipeMinDistance
					) {
					//console.info('swipe');
					//scope.lightbox.temp.allowClick = false;
					scope.lightbox.switchSlide(direction);
				}
				else if (xDistance === 0) {
					// Didn't move cursor, therefore a single click
					scope.lightbox.temp.allowClick = true;
				}
				else {
					scope.lightbox.temp.allowClick = false;
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