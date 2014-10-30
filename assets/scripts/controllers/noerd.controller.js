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
     * @name frostNoerdDk - MainController
     * @description
     * # frostNoerdDk
     *
     * Main module of the application.
     */

    angular
      .module('NoerdDk')
      .controller('NoerdCtrl', NoerdCtrl);

    /* @ngInject */
    function NoerdCtrl($scope, $window) {
        console.log('NoerdCtrl');

		var noerd = this;
		noerd.options = {
			debug: true,
			headerHeight: 100,
			minDistance: 10
		};
		noerd.posAtLastChange = null;
		noerd.states = {
			hideHeader: false,
			showAsidemenu: false
		};

		// Public functions
		noerd.toogleAsideMenu = toogleAsideMenu;

		/**---------------------------------------
		 FUNCTION LIBRARY
		 ---------------------------------------**/
			// Toogle aside menu
		function toogleAsideMenu(state) {
			state = (state === undefined) ? 'toggle' : state;
			if (state === 'toggle') {
				state = !noerd.states.showAsidemenu;
			}
			noerd.states.showAsidemenu = state;
		}
		// Debug log
		function log(msg1, msg2) {
			msg1 = (msg1 === undefined) ? null : msg1;
			msg2 = (msg2 === undefined) ? null : msg2;
			if (noerd.options.debug) {
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
		/**---------------------------------------
		 BINDINGS
		 ---------------------------------------**/
		angular.element($window).bind('scroll', function(event) {
			log('scroll', event);
			log('$window', $window);
			log('scrollY', $window.scrollY);
			var scrollY = $window.scrollY;
			if (scrollY > noerd.options.headerHeight) {
				$scope.$apply(function() {
					noerd.states.hideHeader = true;
				});
			}
			else {
				$scope.$apply(function() {
					noerd.states.hideHeader = false;
				});
			}
		});
		angular.element($window).bind('mousewheel DOMMouseScroll', function(event) {
			var direction = (event.wheelDelta || event.detail);
			//log('mousewheel', direction);

		});

    }
})();