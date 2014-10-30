(function (undefined) {
    'use strict';

	/**
	* @ngdoc overview
	* @name angularApp
	* @description
	* # angularApp
	*
	* Main module of the application.
	*/
	angular
		.module('NoerdDk', [])
		.run(function () {
			console.log('Main Application Run()');
		});
})();