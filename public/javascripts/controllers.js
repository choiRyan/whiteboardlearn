var wbApp = angular.module('wbApp', []);

wbApp.controller('wbCtrl', function($scope){
	$scope.submissions = [];
	//gets all student-submitted questions and their upvotes
	var class_code = $scope.code;
	var Data = $resource('/partials/:code', {code: class_code});
	//	var d = Data.get({
	
});