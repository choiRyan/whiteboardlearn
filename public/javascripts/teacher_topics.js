var socket;
var qcode;
var content;
var field;
var submitButton;
window.onload = function() {
    socket = io.connect('http://ec2-54-201-215-248.us-west-2.compute.amazonaws.com');
    content = document.getElementById("content");
    qcode = document.getElementById("classCode");
    field = document.getElementById("topicField");
    submitButton = document.getElementById("submit");

    //on loading the page, ask for all the topics and the corresponding ratings
    socket.on('connect', function(data){
	    socket.emit('getFeedbackTopics', {code:qcode.value});
    });
    //click submit --> send the Q data to server
    submitButton.onclick = function(){
	if(field.value != "" && field.value){ // should fill out field first..
	    socket.emit('newFeedbackTopic', {code:qcode.value, t:field.value});
	    field.value = "";
	}
	return false;
    };

    //listens for changes in db, updates page with latest ratings.
    socket.on('updateTopics', function(fb){
	    if(fb.length > 0){ // only if fb isn't undefined...
		var html = '';
		for(var i = 0; i <fb.length; i++){
		    //first calculate average
		    var avg = 0.0;
		    var ratingLog = [0,0,0,0,0];
		    for(var j=0; j<fb[i].dist.length; j++){
			avg+=fb[i].dist[j];
			if(fb[i].dist[j] == 1) ratingLog[0]+=1;
			if(fb[i].dist[j] == 2) ratingLog[1]+=1;
			if(fb[i].dist[j] == 3) ratingLog[2]+=1;
			if(fb[i].dist[j] == 4) ratingLog[3]+=1;
			if(fb[i].dist[j] == 5) ratingLog[4]+=1;
		    }
		    avg=avg/fb[i].dist.length;
		    //now add the button
		    if(isNaN(avg)){
			html += '<h4><b>'+fb[i].t+'</b></h4><p>No response</p>';
		    }else{
			html += '<h4><b>'+fb[i].t+'</b>:</h4> <p>Average: ' + avg.toFixed(2) + ', 1: '+ratingLog[0] + ', 2: ' +ratingLog[1] + ', 3: '+ratingLog[2] + ', 4: ' + ratingLog[3] + ', 5: ' + ratingLog[4] + '</p>';
		    }
		    content.innerHTML = html;
		}//end for(all tq)
		return false;
	    }
    });
};