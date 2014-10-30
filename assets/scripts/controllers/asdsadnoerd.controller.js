//'use strict';

// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame       ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame    ||
		function( callback ){
			window.setTimeout(callback, 1000 / 60);
		};
})();

(function (undefiend) {

	// Debug
	//document.ontouchmove = function(event){
		//event.preventDefault();
		//event.stopPropagation();
	//};


	var datafeed = {
		departures: [
			{
				name: 'København',
				id: 'CPH',
				flag: 'dk'
			},
			{
				name: 'Aalborg',
				id: 'AAL',
				flag: 'dk'
			},
			{
				name: 'Aarhus',
				id: 'AAR',
				flag: 'dk'
			},
			{
				name: 'Billund',
				id: 'BLL',
				flag: 'dk'
			},
			{
				name: 'Rønne',
				id: 'RNN',
				flag: 'dk'
			},
			{
				name: 'Hamburg',
				id: 'HAM',
				flag: 'd'
			},
			{
				name: 'Færøerne',
				id: 'FAE',
				flag: 'dk'
			},
			{
				name: 'Malmø',
				id: 'MMA',
				flag: 's'
			},
			{
				name: 'Rom',
				id: 'ROM',
				flag: 'i'
			},
			{
				name: 'Venedig',
				id: 'VCE',
				flag: 'i'
			},
			{
				name: 'Barcelona',
				id: 'BCN',
				flag: 'e'
			},
			{
				name: 'Malaga / Costa del Sol',
				id: 'AGP',
				flag: 'e'
			},
			{
				name: 'Paris',
				id: 'PAR',
				flag: 'f'
			},
			{
				name: 'NICE',
				id: 'NCE',
				flag: 'f'
			},
			{
				name: 'Bordeaux',
				id: 'BOD',
				flag: 'f'
			},
			{
				name: 'Bangkok',
				id: 'BKK',
				flag: 'th'
			},
			{
				name: 'Athen',
				id: 'ATH',
				flag: 'gr'
			},
			{
				name: 'London',
				id: 'LON',
				flag: 'gb'
			},
			{
				name: 'Oslo',
				id: 'OSL',
				flag: 'n'
			},
			{
				name: 'Stockholm',
				id: 'STO',
				flag: 's'
			},
			{
				name: 'Berlin',
				id: 'BER',
				flag: 'd'
			}
		],
		destinations: [
			{
				name: 'Spanien',
				index: 0,
				towns: [
					{
						name: 'Costa del Sol',
						id: 'CSOL_R'
					},
					{
						name: 'Barcelona',
						id: 'BCN'
					}
				]
			},
			{
				name: 'Storbritannien',
				index: 1,
				towns: [

				]
			},
			{
				name: 'USA',
				index: 2,
				towns: [
					{
						name: 'New York',
						id: 'NYC'
					},
					{
						name: 'Florida',
						id: 'USFL_R'
					}
				]
			},
			{
				name: 'Frankrig',
				index: 3,
				towns: [

				]
			},
			{
				name: 'Tyskland',
				index: 4,
				towns: [

				]
			},
			{
				name: 'Italien',
				index: 5,
				towns: [

				]
			},
			{
				name: 'Danmark',
				index: 6,
				towns: [

				]
			},
			{
				name: 'Tjekkiet',
				index: 7,
				towns: [

				]
			},
			{
				name: 'Malta',
				index: 8,
				towns: [

				]
			},
			{
				name: 'Thailand',
				index: 9,
				towns: [

				]
			},
			{
				name: 'Tyrkiet',
				index: 10,
				towns: [

				]
			},
			{
				name: 'Portugal',
				index: 11,
				towns: [

				]
			},
			{
				name: 'Holland',
				index: 12,
				towns: [

				]
			},
			{
				name: 'Forenede Arabiske Emirater',
				index: 13,
				towns: [

				]
			},
			{
				name: 'Kroatien',
				index: 14,
				towns: [

				]
			}
		]
	};


	angular
        .module('fdm-banner')
        .controller('bannerCtrl', bannerCtrl);

	/* @ngInject */
	function bannerCtrl($scope, $timeout, $interval) {

		// Data
		var banner = this;
		banner.options = {
			debug: true,
			loop: false,
			searchurl: 'http://rejser.fdm-travel.dk/soeger?',
			search: {
				searchtype: 1,
				departuredate: '',
				arriveat: '',
				returndate: '',
				//paxcombination: '',
				departurecity: ''
				//roomchildage: ''
			}
		};
		banner.fps = -1;
		banner.departures = datafeed.departures;
		banner.destinations = datafeed.destinations;
		banner.activeStep = 0;
		banner.lastStep = 2;
		banner.timer = null;
		banner.dates = generateDates();
		banner.steps = [
			{
				id: 0,
				name: 'Step 1',
				require: [],
				activeSubStep: -1,
				states: {
					valid: false,
					locked: false,
					done: false
				},
				substeps: [
					{
						id: 0,
						name: 'Substep 1'
					}
				]
			},
			{
				id: 1,
				name: 'Step 2',
				require: [0],
				activeSubStep: -1,
				states: {
					valid: false,
					locked: true,
					done: false
				},
				substeps: [
					{
						id: 0,
						name: 'Substep 1'
					}
				]
			},
			{
				id: 2,
				name: 'Step 3',
				require: [0,1],
				activeSubStep: -1,
				states: {
					valid: false,
					locked: true,
					done: false
				},
				substeps: [
					{
						id: 0,
						name: 'Substep 1'
					}
				]
			}
		];
		banner.states = {
			hideVeil: false,
			noAnimate: false
		};
		banner.css = {};
		banner.temp = {
			frameCount: 0
		};

		// Public functions
		banner.checkstep = checkstep;
		banner.setStepValidation = setStepValidation;
		banner.switchstep = switchstep;
		banner.returnOptionsClass = returnOptionsClass;
		banner.formvalidate = formvalidate;
		banner.getTowns = getTowns;
		banner.checkKidsStep = checkKidsStep;
		banner.send = send;

		/** BINDINGS */
		// Update framerate every second
		$interval(function(){
			banner.fps = banner.temp.frameCount;
			banner.temp.frameCount = 0;
		},1000);

		/** INITIATE */
		// Start update loop
		updateLoop();
		updateLocks();
		// Drop veil
		$timeout(function() {
			banner.states.hideVeil = true;
		},1000);

		/** FUNCTION LIBRARY */

		// Debug
		function log(msg1, msg2) {
			msg1 = (msg1 === undefiend) ? null : msg1;
			msg2 = (msg2 === undefiend) ? null : msg2;
			if (banner.options.debug) {
				if (msg2 !== null) {
					console.log(msg1, msg2);
				}
				else {
					console.log(msg1);
				}
			}
		}

		function clone(obj) {
			if (null === obj || 'object' !== typeof obj) {
				return obj;
			}
			var copy = obj.constructor();
			for (var attr in obj) {
				if (obj.hasOwnProperty(attr)) {
					copy[attr] = obj[attr];
				}
			}
			return copy;
		}

		function encodeQueryData(data) {
			var ret = [];
			for (var d in data) {
				ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
			}
			return ret.join('&');
		}

		function yyyymmdd(date) {
			var yyyy = date.getFullYear().toString();
			var mm = (date.getMonth()+1).toString(); // getMonth() is zero-based
			var dd  = date.getDate().toString();
			return yyyy + (mm[1]?mm:'0'+mm[0]) + (dd[1]?dd:'0'+dd[0]); // padding
		}

		function send() {
			var data = clone(banner.options.search);

			data.departurecity = $scope.formdata.departureLocation;
			data.arriveat =  $scope.formdata.destianationTown;
			data.departuredate = (function(){
				var realMonth = banner.dates[parseInt($scope.formdata.departureMonth)];
				var date = new Date(realMonth.year, (realMonth.value), $scope.formdata.departureDate);
				date = yyyymmdd(date);
				return date;
			})();
			data.returndate = (function(){
				var realMonth = banner.dates[parseInt($scope.formdata.returnMonth)];
				var date = new Date(realMonth.year, (realMonth.value), $scope.formdata.returnDate);
				date = yyyymmdd(date);
				return date;
			})();

			/*
			var temp = {
				departureDate: '1',
				departureLocation: 'AAR',
				departureMonth: '1',
				destianationCountry: 'Spanien',
				destianationTown: 'Costa del Sol',
				returnDate: '4',
				returnMonth: '2',
				roomAdults: '2',
				roomKids: '0',
			 	roomInfants: '0'
			};
			*/

			log('data:after', data);

			var queryString = encodeQueryData(data);

			queryString = queryString + '&paxcombination=' + $scope.formdata.roomAdults + 'ADT' + ',' + (parseInt($scope.formdata.roomInfants) + parseInt($scope.formdata.roomKids)) + 'CHD';
			if (parseInt($scope.formdata.roomInfants) > 0 || parseInt($scope.formdata.roomKids) > 0) {
				queryString = queryString + '&roomchildage=' + (function(){
					var result = '';
					var i;
					for (i=0;i<parseInt($scope.formdata.roomInfants); i++) {
						result = result + '2,';
					}
					for (i=0;i<parseInt($scope.formdata.roomKids); i++) {
						result = result + '10,';
					}
					return result;
				})();
			}


			log('queryString', queryString);
			var url = banner.options.searchurl + queryString;
			window.open(url,'_blank');



			//http://rejser.fdm-travel.dk/soeger?searchtype=0&departuredate=20141103&returndate=20141110&departurecity=CPH&arriveat=MIA&paxcombination=2ADT,2CHD*2ADT&roomchildage=6,11*
			//http://rejser.fdm-travel.dk/soeger?searchtype=0&departuredate=20141103&returndate=20141110&departurecity=CPH&arriveat=MIA&paxcombination=2ADT
			//http://rejser.fdm-travel.dk/soeger?searchtype=0&departuredate=20141103&returndate=20141110&departurecity=CPH&arriveat=MIA&paxcombination=2ADT,2CHD&roomchildage=0,0

			//http://rejser.fdm-travel.dk/soeger?searchtype=1&departuredate=20141210&arriveat=CSOL_R&returndate=20141216&paxcombination=&departurecity=CPH&paxcombination=2ADT,0CHD
			//http://rejser.fdm-travel.dk/soeger?searchtype=1&departuredate=20141210&arriveat=CSOL_R&returndate=20141216&paxcombination=&departurecity=CPH&paxcombination=2ADT,3CHD&roomchildage=0,0,


			//http://rejser.fdm-travel.dk/soeger?searchtype=1&departuredate=20150204&arriveat=CSOL_R&returndate=20150211&departurecity=CPH&paxcombination=2ADT,3CHD&roomchildage=0,0,0,
			//http://rejser.fdm-travel.dk/soeger?searchtype=1&departuredate=20141103&arriveat=CSOL_R&returndate=20141110&departurecity=CPH&paxcombination=2ADT,8CHD&roomchildage=99,99,99,99,99,99,99,99,

		}

		function getTowns(countryname) {
			var towns = null;
			for (var i=0;i<banner.destinations.length;i++) {
				var destination = banner.destinations[i];
				if (destination.name === countryname) {
					towns = destination.towns;
					break;
				}
			}
			return towns;
		}

		function daysInMonth(month,year) {
			var numOfDates =  new Date(year, (month+1), 0).getDate();
			//log(month, numOfDates);
			var dates = [];
			for (var i=1;i<=numOfDates;i++) {
				dates.push(i);
			}
			return dates;
		}

		function generateDates() {
			var currentDate = new Date();
			var currentYear = currentDate.getFullYear();
			var currentMonthIndex = currentDate.getMonth();
			var currentDayIndex = currentDate.getDate();

			var monthList = ['Januar', 'Februar', 'Marts', 'April', 'Maj', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'December'];
			var months = [];
			var i = 0;
			for (i=0;i<monthList.length;i++) {
				var newIndex = (currentMonthIndex + i) % monthList.length;
				var year = currentYear;
				if (currentMonthIndex + i > (monthList.length - 1)) {
					year++;
				}
				months[i] = {
					name: monthList[newIndex],
					value: newIndex,
					index: i,
					year: year,
					dates: daysInMonth(newIndex, year)
				};
			}
			log('months', months);
			return months;
		}

		function returnOptionsClass(name) {
			return 'form__option--'+name;
		}

		function checkKidsStep() {

		}

		// Check step
		function checkstep(id) {
			if (id !== undefined) {
				if (id === banner.activeStep) {
					return true;
				}
				else {
					return false;
				}
			}
		}

		function addStep() {
			var numOfStep = banner.steps.length;
			var id = numOfStep;
			banner.steps[id] = {
				id: id,
				name: 'Step '+id,
				require: [],
				states: {
					valid: false,
					locked: false,
					done: false
				}
			};
			validateLastStep();
			return id;
		}

		function removeStep(id) {
			banner.steps.slice(id,1);
			validateLastStep();
		}

		function validateLastStep() {
			banner.lastStep = banner.steps.length-1;
		}

		function setStepValidation(id, state, goToNext) {
			goToNext = (goToNext === undefiend) ? false : goToNext;
			var step = banner.steps[id];
			if (step !== undefiend) {
				step.states.valid = state;
				updateLocks(); // Update lock states
				if (goToNext) {
					switchstep(id+1);
				}
			}
		}

		// Switch Step
		function switchstep(direction, jump, animate) {

			log('$scope',$scope);

			direction = (direction === undefined) ? 1 : direction;
			jump = (jump === undefined) ? false : jump;
			animate = (animate === undefined) ? true : animate;
			$timeout.cancel(banner.timer);

			var activeIndex = banner.activeStep;
			var newActiveIndex;
			var numOfSlides = banner.steps.length;
			banner.states.noAnimate = !animate;
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
				if (banner.options.loop) {
					newActiveIndex = (activeIndex + direction) % numOfSlides;
				}
				else {
					newActiveIndex = activeIndex + direction;
					if (newActiveIndex > (numOfSlides-1)) {
						newActiveIndex = numOfSlides-1;
					}
				}
			}
			if (newActiveIndex < 0) {
				if (banner.options.loop) {
					newActiveIndex = Math.abs(numOfSlides + newActiveIndex);
				}
				else {
					newActiveIndex = 0;
				}
			}
			//updateLocks(); // Update lock states
			var locked = checklock(newActiveIndex);
			if (!locked) {
				banner.activeStep = newActiveIndex;
			}
		}

		// Check lock
		function checklock(id) {
			var step = banner.steps[id];
			if (step !== undefined) {
				return step.states.locked;
			}
			else {
				return false;
			}
		}

		// Update Locks
		function updateLocks() {
			var steps =  banner.steps;
			for (var i=0;i<steps.length;i++) {
				var step = steps[i];
				var anyNotValid = false;
				if (step.require !== undefined && step.require.length > 0) {
					// Find step required step and check their valid state
					for (var ii=0;ii<step.require.length; ii++) {
						var requiredStep = step.require[ii];
						if (!steps[requiredStep].states.valid) {
							anyNotValid = true;
						}
					}
					step.states.locked = anyNotValid;
				}
				else {
					step.states.locked = anyNotValid;
				}
				if (!step.states.locked && !step.states.done) {

				}
			}
		}

		function getFormValidation(formname){
			var form = $scope[formname];
			log('getFormValidation', form);
			if (form !== undefiend) {
				if (!form.$invalid) {
					return true;
				}
				else {
					return false;
				}
			}
		}

		function formvalidate(formname, callback) {
			if (formname === undefiend) {
				return;
			}
			var valid = getFormValidation(formname);

			log(formname, valid);

			if (!valid) {
				return;
			}
			else {
				if (callback && typeof(callback) === 'function') {
					//callback();
				}
				else {
					//eval(callback)
				}
			}
		}

		// Update Loop
		function updateLoop() {
			window.requestAnimFrame(updateLoop);
			update();
			banner.temp.frameCount++;
		}

		function update() {

		}

    }
})();