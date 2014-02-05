var qcode;
var content;
var qfield;
var f1, f2, f3, f4;
var submitButton;
window.onload = function() {
    socket = io.connect('http://ec2-54-201-215-248.us-west-2.compute.amazonaws.com');
    content = document.getElementById("content");
    qcode = document.getElementById("classCode");
    qfield = document.getElementById("qf");
    f1 = document.getElementById("o1f");
    f2 = document.getElementById("o2f");
    f3 = document.getElementById("o3f");
    f4 = document.getElementById("o4f");
    submitButton = document.getElementById("submit");
    
    //on loading the page, ask for latest question and results
    socket.on('connect', function(data){
	    socket.emit('getLatestClickerQ',{code:qcode.value});
	});

    //listen for new responses or questions~
    socket.on('updateClickerQ', function(data){
	    if(data.cq){
		/*		var html = '';
		html+='<h5><b>' + data.cq.q  + '</b></h5>';
		if(data.cq.o1 != "")
		html+='<p>' + data.cq.r1 + ' : '  + data.cq.o1 + '</p>';
		if(data.cq.o2 != "")
		html+='<p>' + data.cq.r2 + ' : '  + data.cq.o2 + '</p>';
		if(data.cq.o3 != "")
		html+='<p>' + data.cq.r3 + ' : '  + data.cq.o3 + '</p>';
		if(data.cq.o4 != "")
		html+='<p>' + data.cq.r4 + ' : '  + data.cq.o4 + '</p>';
		content.innerHTML = html;*/

		//find highest data point
	        var highest = 0;
		if(data.cq.r1){
		    if(data.cq.r1 > highest) highest = data.cq.r1;
		}
		if(data.cq.r2){
		    if(data.cq.r2 > highest) highest = data.cq.r2;
		}
		if(data.cq.r3){
		    if(data.cq.r3 > highest) highest = data.cq.r3;
		}
		if(data.cq.r4){
		    if(data.cq.r4 > highest) highest = data.cq.r4;
		}
		//graph data
		var barChartData = {
		    labels : [data.cq.o1, data.cq.o2, data.cq.o3, data.cq.o4],
		    datasets : [
		{
		    fillColor : "rgba(151,187,205,0.5)",
		    strokeColor : "rgba(151,187,205,1)",
		    data : [data.cq.r1, data.cq.r2, data.cq.r3, data.cq.r4]
		}
				]
		}
		var myLine = new Chart(document.getElementById("canvas").getContext("2d")).Bar(barChartData,{scaleSteps:highest,scaleStepWidth:1});
		return false;
	    }
	});

    //on submit, check fields and then send
    submitButton.onclick = function(){
	if(qfield.value != ""){ // if question field is filled
	    var oc=0;
	    if(f1.value != "") oc+=1; // if >=2 options filled
	    if(f2.value != "") oc+=1;
	    if(f3.value != "") oc+=1;
	    if(f4.value != "") oc+=1;
	    if(oc>=2){ 
		socket.emit('sendClickerQ',{code:qcode.value,q:qfield.value,o1:f1.value, o2:f2.value,o3:f3.value,o4:f4.value});
		f1.value = "";
		f2.value = "";
		f3.value = "";
		f4.value = "";
		qf.value = ""; //clear all fields after sending
	    }
	}
    };

};