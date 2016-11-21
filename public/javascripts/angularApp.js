var app = angular.module('CSUFGO', ['ui.router']);

// this is a 'service' or 'factory' for the events
app.factory('events', ['$http', function($http){
	var o = {
		events: []
	};
	// this function gets all the events for the webpage from the DB
	o.getAll = function() {
		return $http.get('/events').success(function(data){
			angular.copy(data, o.events);
		});
	};
	// this function allows for events to be created and saved to DB
	o.create = function(event) {
		return $http.post('/events', event).success(function(data){
			o.events.push(data);
		});
	};
	// This function gets a single post from our server
	o.get = function(id) {
		return $http.get('/events/' + id).then(function(res){
			return res.data;
		});
	};
	o.addSubscriber = function(id, subscriber) {
		return $http.post('/events/' + id + '/subscribers', subscriber);
	};
	return o;
}]);

// this is providing the states to the index.html
// states == various pages
app.config([
	'$stateProvider',
	'$urlRouterProvider',
	function($stateProvider, $urlRouterProvider){

		$stateProvider
			.state('home', {
				url: '/home',
				templateUrl: '/home.html',
				controller: 'MainCtrl',
				resolve: {
					eventPromise: ['events', function(events){
						return events.getAll();
					}]
				}
			})
			.state('events', {
				url: '/events/{id}',
				templateUrl: '/events.html',
				controller: 'EventsCtrl',
				resolve: {
					event: ['$stateParams', 'events', function($stateParams, events){
						return events.get($stateParams.id);
					}]
				}
			})
			.state('createEvent', {
				url: '/createEvent',
				templateUrl: '/createEvent.html',
				controller: 'CreateEventCtrl',
				resolve: {
					eventPromise: ['events', function(events){
						return events.getAll();
					}]
				}
			});

		$urlRouterProvider.otherwise('home');
}]);

// This is controlling the homepage part at the moment: allows user to add an event
app.controller('MainCtrl', [
	'$scope',
	'events',
	function($scope, events){
		$scope.events = events.events;
	}
]);

/* Old Code ---
// This is controlling the events description page: allows user to view event details and subscribe
app.controller('EventsCtrl', [
	'$scope',
	'$stateParams',
	'events',
	function($scope, $stateParams, events){
		$scope.event = events.events[$stateParams.id];
		$scope.addSubscriber = function(){
			if(!$scope.firstname || $scope.firstname == '') { return; }
			if(!$scope.lastname || $scope.lastname == '') { return; }
			$scope.event.subscribers.push({
				firstname: $scope.firstname,
				lastname: $scope.lastname
			});
			$scope.firstname = '';
			$scope.lastname = '';
		}
	}
]);
*/

app.controller('EventsCtrl', [
	'$scope',
	'events',
	'event',
	function($scope, events, event){
		$scope.event = event;
		$scope.addSubscriber = function(){
			if(!$scope.firstname || $scope.firstname == '') { return; }
			if(!$scope.lastname || $scope.lastname == '') { return; }
			console.log("HERE" + $scope.firstname + " " + $scope.lastname);
			events.addSubscriber(event._id, {
				firstname: $scope.firstname,
				lastname: $scope.lastname,
			}).success(function(subscriber){
				$scope.event.subscribers.push(subscriber);
			});
			$scope.firstname = '';
			$scope.lastname = '';
		};
	}
]);

app.controller('CreateEventCtrl', [
	'$scope',
	'$state',
	'events',
	function($scope, $state, events){
		$scope.events = events.events;
		$scope.addEvent = function(){
			if(!$scope.title || $scope.title == '') { return; }
			if(!$scope.time || $scope.time == '') { return; }
			if(!$scope.location || $scope.location == '') { return; }
			if(!$scope.contact || $scope.contact == '') { return; }
			if(!$scope.description || $scope.description == '') { return; }
			/* Old code --
			$scope.events.push({
				title: $scope.title,
				time: $scope.time,
				location: $scope.location,
				contact: $scope.contact,
				description: $scope.description,
				subscribers: [
					{firstname: "Josh", lastname: "Fin"},
					{firstname: "Bob", lastname: "Durstein"}
				]
			});
			*/
			events.create({
				title: $scope.title,
				time: $scope.time,
				location: $scope.location,
				contact: $scope.contact,
				description: $scope.description
			}).then(function(){
				$state.go('home');
			});
			$scope.title = '';
			$scope.time = '';
			$scope.location = '';
			$scope.contact = '';
			$scope.description = '';
		};
	}
]);
