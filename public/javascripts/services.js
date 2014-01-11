angular module('pollServices', ['ngResource']).
    factory('Poll', function($resource){
	    return $resource('polls/:pollId',{},{
	        query: {method: 'GET', params: {pollId:'clicker'},isArray:true}
	    })
    });