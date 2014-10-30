(function (undefined) {
    'use strict';

    /**
     * @ngdoc overview
     * @name frostNoerdDk - HeaderCtrl
     * @description
     * # frostNoerdDk
     *
     * Main module of the application.
     */

    angular
      .module('NoerdDk')
      .controller('HeaderCtrl', HeaderCtrl);

    /* @ngInject */
    function HeaderCtrl($scope, $window) {

		var header = this;
		header.options = {
			debug: true,
			height: 100,
			minDistance: 10
		};
		header.posAtLastChange = null;
		header.states = {
			hideHeader: false,
			showAsidemenu: false
		};

		// Public functions
		header.toogleAsideMenu = toogleAsideMenu;

/**---------------------------------------
		FUNCTION LIBRARY
---------------------------------------**/
		// Toogle aside menu
		function toogleAsideMenu(state) {
			state = (state === undefined) ? 'toggle' : state;
			if (state === 'toggle') {
				state = !header.states.showAsidemenu;
			}
			header.states.showAsidemenu = state;
		}
		// Debug log
		function log(msg1, msg2) {
			msg1 = (msg1 === undefined) ? null : msg1;
			msg2 = (msg2 === undefined) ? null : msg2;
			if (header.options.debug) {
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
			if (scrollY > header.options.height) {
				$scope.$apply(function() {
					header.states.hideHeader = true;
				});
			}
			else {
				$scope.$apply(function() {
					header.states.hideHeader = false;
				});
			}
		});
		angular.element($window).bind('mousewheel DOMMouseScroll', function(event) {
			var direction = (event.wheelDelta || event.detail);
			//log('mousewheel', direction);

		});

    }
})();