var socket;
var qcode; // need for functions accessed outside of window.onload
var pastUpvotes;
window.onload = function() {
 
    socket = io.connect('http://ec2-54-201-215-248.us-west-2.compute.amazonaws.com');
    var field = document.getElementById("questionField");
    var sqUpvote = document.getElementById("sqUpvote");
    var submitButton = document.getElementById("askQuestion");
    var content = document.getElementById("content");
    qcode = document.getElementById("classCode");
    var qindex = -1;
    pastUpvotes = [];
    socket.on('connect',function(data){

	    //ask for all the questions when page loads
	    socket.emit('getStudentQuestions', {code:qcode.value}); 
	});

    //asking a new question, sending to server
    socket.on('newStudentQ', function (sq) {
	    if(sq) {
		var html = '';
		for(var i=0; i<sq.length; i++) {
		    if(isIn(pastUpvotes, i)){ // if already upvoted; disable
html += '<p><button class="small success button choice" disabled onclick="upvotebuttonpressed(this);" name='+i+'>Upvote (' + sq[i].ups + ')</button>' + sq[i].q + '</p>';
		    }else{ 
html += '<p><button class="small success button choice" onclick="upvotebuttonpressed(this);" name='+i+'>Upvote (' + sq[i].ups + ')</button>' + sq[i].q + '</p>';
		    }
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
		    if(isIn(pastUpvotes, i)){ // if already upvoted; disable
html += '<p><button class="small success button choice" disabled name='+i+'>Upvote (' + sq[i].ups + ')</button>' + sq[i].q + '</p>';
                    }else{
			var string = "onclick:sqindex.value= ";
			string.concat(i.toString());
			html += '<p><button class="small success button choice" onclick="upvotebuttonpressed(this);" name='+i+'>Upvote (' + sq[i].ups + ')</button>' + sq[i].q + '</p>';
                    }
		}
		content.innerHTML = html;
		return false;
	    }else{
		console.log("There is a problem: ", data);
	    }
	});

    //click to submit a question
    submitButton.onclick = function() {
	var text = field.value;
	if(text != ""){
	    console.log(qcode);
	    socket.emit('studentQasked',{code:qcode.value, q:text, ups:0});
	    field.value = "";
	}
	return false;
    };
    function upvotebuttonpressed(input){
	alert(input.name);
	console.log("weffwlkjfewjlkfweljkefwjkl0");
    };
};

//Utility function, see if an int[] contains a specific int
function isIn(array, obj){
    for(var i=0; i<array.length; i++){
	if(array[i] === obj){
	    return true;
	}
    }
    return false;
};

//click to upvote a question

function upvotebuttonpressed(input){
    //alert(input.value + " "+input.name );
     console.log('REACHED UPVOTE BUTTON PRESSED for q #' + input.name);
     var sqIndex = input.name;
     socket.emit('upvoted',{code:qcode.value, sqindex:input.name});
    //add the index of upvote coresponding Q so no repeat upvoting
     pastUpvotes.push(+input.name); // +var == parseInt(var)
    console.log("PAST UPVOTES: "+ pastUpvotes);
    };
