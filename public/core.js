var clicker = angular.module('clickerApp', []);

function mainController($scope, $http){
    $scope.formData = {};

    //land on page, get latest question and options and show
    $http.get('/clicker_view').success(function(data){
	    $scope.question = data;
	    console.log(data);
	})
	.error(function(err){ 
		console.log('Error: ' + err);
	});

    //when submitting ADD QUESTION, send the text to the api?
    $scope.createQuestion = function(){
	$http.post('/clicker_create',$scope.formData)
	.success(function(data){
		$scope.formData = {}; // clear forms
		$scope.question = data;
		console.log(data);
	    })
	.error(function(err){
		console.log('Error: ' + err);
	    });
    };
}