window.onload = function() {
 
    //    var questions = [];
    //var ups = [];
    var socket = io.connect('http://ec2-54-201-215-248.us-west-2.compute.amazonaws.com');
    var field = document.getElementById("questionField");
    var submitButton = document.getElementById("askQuestion");
    //var upvoteButton = document.getElementById("upvote");
    var content = document.getElementById("content");
    var qcode = document.getElementById("classCode");
    var qindex = -1;
    socket.on('connect',function(data){
	    //ask for all the questions when page loads
	    socket.emit('getStudentQuestions', {code:qcode.value}); 
	});
    //asking a new question, sending to server
    socket.on('newStudentQ', function (sq) {
	    console.log("HERE IS DATA" + sq + " end data");
	    if(sq) {
		var html = '';
		for(var i=0; i<sq.length; i++) {
		    html += '<p><a href="#" class="small success button choice">Upvote (' + sq[i].ups +  ')</a>' + sq[i].q + '</p>';
		}
		content.innerHTML = html;
		return false;
	    } else {
		console.log("There is a problem:", data);
	    }
	});
    //received response from server with all the questions from the class
    socket.on('studentQuestionReload', function(sq){
	    if(sq){ // if we got a response
		var html = ''; //put the questions in the html
		for(var i=0; i<sq.length; i++){ //sq: [{q:String,ups:Number}]
		    html += '<p><a href="#" class="small success button choice">Upvote (' + sq[i].ups + ')</a>' + sq[i].q + '</p>';
		}
		content.innerHTML = html;
		return false;
	    }else{
		console.log("There is a problem: ", data);
	    }
	});
    //click to submit a question
    submitButton.onclick = function() {
		   console.log('detected onclick, sending ' + field.value + " " + qcode );
	   var text = field.value;
	   if(text != ""){
	       console.log(qcode);
	       socket.emit('studentQasked',{code:qcode.value, q:text, ups:0});
	       field.value = "";
	   }
	  return false;
    };
}