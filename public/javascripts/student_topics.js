var socket;
var qcode;
var content;
window.onload = function() {
    socket = io.connect('http://ec2-54-201-215-248.us-west-2.compute.amazonaws.com');
    qcode = document.getElementById("classCode");
    content = document.getElementById("content");
    //on loading the page, get all the tq[i].t
    socket.on('connect', function(Data){
	    socket.emit('getFeedbackTopics',{code:qcode.value});
    });
    socket.on('updateTopics',function(fb){
	    if(fb.length > 0){
		var html = '';
		//add the topic and buttons to inner html...
		for(var i=0; i<fb.length; i++){
		    html+='<h4><b>'+fb[i].t+'</b></h4>';
		    html+='<ul class="button-group round even-5" id="'+i+'">';
		    html+='<li><button onclick="selected(this,'+i+');" class="small alert button" id="one" name="'+i+'">1</button></li>';
		    html+='<li><button onclick="selected(this,'+i+');" class="small orange button" id="two" name="'+i+'">2</button></li>';
		    html+='<li><button onclick="selected(this,'+i+');" class="small yellow button" id="three" name="'+i+'">3</button></li>';
		    html+='<li><button onclick="selected(this,'+i+');" class="small lime button" id="four" name="'+i+'">4</button></li>';
		    html+='<li><button onclick="selected(this,'+i+');" class="small success button" id="five" name="'+i+'">5</button></li>';
		    html+='</ul>';
		}
		content.innerHTML = html;
	    }
    });
};

//if a button is pressed, send the feedback, disable the row of buttons
function selected(buttonPressed, bgID){
    var rowOfButtons = document.getElementsByName(buttonPressed.name);
    //alert(rowOfButtons.length + " elements with name " + buttonPressed.name );
    for(var i=0; i<rowOfButtons.length; i++){
	rowOfButtons[i].disabled = true;
    }
    if(buttonPressed.id=="one"){
	socket.emit('submitFeedback',{code:qcode.value,tIndex:bgID,d:1});
    }else if(buttonPressed.id=="two"){
	socket.emit('submitFeedback',{code:qcode.value,tIndex:bgID,d:2});
    }else if(buttonPressed.id=="three"){
	socket.emit('submitFeedback',{code:qcode.value,tIndex:bgID,d:3});
    }else if(buttonPressed.id=="four"){
	socket.emit('submitFeedback',{code:qcode.value,tIndex:bgID,d:4});
    }else if(buttonPressed.id=="five"){
	socket.emit('submitFeedback',{code:qcode.value,tIndex:bgID,d:5});
    }
}
