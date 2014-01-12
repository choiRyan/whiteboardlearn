var socket;
var qcode;
window.onload = function(){
    socket = io.connect('http://ec2-54-201-215-248.us-west-2.compute.amazonaws.com');
    var content = document.getElementById("content");
    qcode = document.getElementById("classCode");
    socket.on('connect',function(data){
	    //ask for all questions when page loads, most upvotes on top
	    socket.emit('getStudentQuestions',{code:qcode.value});
	});
    //now listen for student question updates
    socket.on('studentQuestionReload',function(sq){
	if(sq){
	    for(var a=0; a<sq.length-1; a++){
		if(!sq[a].q || sq[a].q == "undefined"){
		    alert("removed " + a + " from array");
		    sq.slice(a,1);
		}
	    }
//sort the list; can't sort in app.js because students have an isomorphic array
	    //TODO sort by upvotes

	    var html = '';
	    for(var i=0; i<sq.length; i++){		
		html += '<p><button class="small success button choice" disabled>Upvotes: ' + sq[i].ups + '</button>' + sq[i].q + '</p>';
	    }
	    content.innerHTML = html;
	    return false;
	}else{
	    console.log("There is a problem: the sq teacher got is: " + data);
	}
    });

};

