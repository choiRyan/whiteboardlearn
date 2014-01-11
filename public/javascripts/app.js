angular.module('polls', [])
    .config(['$routeProvider', function($routeProvider) {
		$routeProvider.
		    when('/polls', { templateUrl: 'partials/list.html', controller: 
			    PollListCtrl }).
		    when('/poll/:pollId', { templateUrl: 'partials/item.html', controller: 
			    PollItemCtrl }).
		    when('/new', { templateUrl: 'partials/new.html', controller: 
			    PollNewCtrl }).
		    otherwise({ redirectTo: '/polls' });
	    }]);