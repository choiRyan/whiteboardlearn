var qcode;
var content;
window.onload = function() {
    socket = io.connect('localhost');
    qcode = document.getElementById("classCode");
    content = document.getElementById("content");

    //on load, get the latest Q (to answer, obviously)
    socket.on('connect', function(data){
            socket.emit('getLatestClickerQ',{code:qcode.value});
        });

    //listen for new questions
    socket.on('updateClickerQ', function(data){ // is just one (the latest) cq object
            if(data.cq){
                var html = '';
                html+='<h5><b>' + data.cq.q  + '</b></h5>'; // just inject this html into <div="content">IT ALL GOES HERE</div>
                if(data.cq.o1 != "")
		    html+='<p><input type="button" onclick="answer(this);" class="small success button choice" id="'+data.cq.id+'" name="1" value="Answer!">'+data.cq.o1+'</input></p>';
                if(data.cq.o2 != "")
		    html+='<p><input type="button" onclick="answer(this);" class="small success button choice" id="'+data.cq.id+'" name="2" value="Answer!">'+data.cq.o2+'</input></p>';
                if(data.cq.o3 != "")
		    html+='<p><input type="button" onclick="answer(this);" class="small success button choice" id="'+data.cq.id+'" name="3" value="Answer!">'+data.cq.o3+'</input></p>';
                if(data.cq.o4 != "")
		    html+='<p><input type="button" onclick="answer(this);" class="small success button choice" id="'+data.cq.id+'" name="4" value="Answer!">'+data.cq.o4+'</input></p>';
                content.innerHTML = html;
                return false;
            }else{
		var html = '<h4>No Current Questions.</h4>';
		content.innerHTML = html;
		return false;
	    }
        });
};

function answer(input){
    socket.emit('answerClickerQ',{code:qcode.value, cqIndex:input.id, choice:input.name});
}
