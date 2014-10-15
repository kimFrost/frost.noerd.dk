(function (undefined) {
    'use strict';

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
    function NoerdCtrl() {
        console.log('NoerdCtrl');
    }
})();