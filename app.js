require('./db');

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var app = express();
var engine = require('ejs-locals');
var mongoose = require( 'mongoose' );
var Whiteboard = mongoose.model( 'Whiteboard' ); 
// all environments
app.set('port', process.env.PORT || 8080);
var server = http.createServer(app);

//socket.io, for listening for server
var io = require('socket.io').listen(server);
server.listen(8080);

io.sockets.on('connection',function(socket){
	socket.on('error',function(err){
		console.log('socket error ' + err);
		socket.destroy();
	    });

	//listens for new clicker questions sent from prof
	socket.on('sendClickerQ',function(data){
		Whiteboard.findOne({code:data.code},function(err,out){
			if(err)console.log("ERROR: "+err);
			else if(out != null){ 
			    Whiteboard.findOneAndUpdate({code:data.code},{$push: {cq:{q:data.q, id: out.ccq, o1:data.o1, o2:data.o2, o3:data.o3, o4:data.o4,r1:0, r2:0, r3:0, r4:0}}},{upsert:false},function(er){
				    if(er){
					console.log("ERROR" + er);
				    }else{
					var temp = out.ccq;
					Whiteboard.update({code:data.code},{$inc:{'ccq':1}}).exec(function(e){
						if(e){console.log("error: "+e);}else{
						    Whiteboard.findOne({code:data.code},function(errf,out1){
							    if(errf)console.log("error: " + errf);
							    else{
								console.log("ccq:"+ out1.ccq);
								console.log(out1.cq[out1.ccq-1]);
								io.sockets.emit("updateClickerQ",{cq:out1.cq[out1.ccq-1]});
							    }
							});
						}
					    });
				    }
				});
			}
		    });	
	    });
	
	//listens for feedback submissions from students, add feedback, update.
	//{code:String,tIndex:String,d:Number}
	socket.on('submitFeedback',function(data){
		Whiteboard.findOne({code:data.code}).exec(function(err,out){
			if(err){
			    console.log("ERROR: " +err);
			}else if(out != null){
			    out.tq[data.tIndex].dist.push(data.d);
			    out.save(function(err){
				    if(err){console.log("error while adding feedback response to list of ratings: "+err);}else{
					//all OK; emit "out" we just saved
					io.sockets.emit('updateTopics',out.tq);
				    }
				});
			}else{
			    console.log("Received null");
			}
		    });
	    });

	//listens for requests for teacher's topics (for feedback)
	socket.on('getFeedbackTopics',function(data){
		Whiteboard.findOne({code:data.code}).exec(function(err,out){
			if(err){
			    console.log("ERROR: " + err);
			}else if(out != null){
			    if(out.tq) io.sockets.emit('updateTopics',out.tq);
		        }else{
			    console.log("received null");
			}
	        });
	});

	//listens for newly submitted teacher's topics (for feedback)
	socket.on('newFeedbackTopic', function(data){ //{code:str,t:str,dist:[]}
		Whiteboard.findOneAndUpdate({code:data.code},{$push:{tq:{t:data.t,dist:[]}}},{upsert:false},function(er,out){if(er){console.log('ERROR: '+er);}
			else if(out != null){
			    console.log(out);
			    io.sockets.emit('updateTopics', out.tq);
			}else{console.log("OUT = NULL?");}
		    });
	    });

	//listens for new access queries for student Q viewing
	socket.on('getStudentQuestions', function(data){
		var ccode = data.code;		
		//look up Qs from mongoDB
		Whiteboard.findOne({code:ccode}).exec(function(err,out){
			if(err){
			    console.log('ERROR: ' + err);
			}else if(out != null){
				//send to all others
				io.sockets.emit('studentQuestionReload',out.sq);
			}
		    });
	    });
	//listens for new student Qs
	socket.on('studentQasked',function(data){
		//add this new question into our database~
	    if(data.q){
		Whiteboard.findOneAndUpdate(
		    {code:data.code},
	            {$push: {sq:{q:data.q,ups:0}}},
		    {upsert:false},
		    function(err,out){if(err){console.log('ERROR '+err);}else{
			    var sqs = out.sq;
			    var temp = {q:data.q,ups:0};
			    //send the new Q AND prev Qs to everyone else also!
			    //io.sockets.emit('newStudentQ',sqs);
			    io.sockets.emit('studentQuestionReload', sqs);
			}
	        });
            }
	});
	socket.on('upvoted',function(data){ // listens for s_Q upvotes
		Whiteboard.findOne({code:data.code}).exec(function(err,out){
			if(err){console.log('ERROR ' + err);}
			else if(out != null){ // standard...
			    var sq = out.sq;
			    console.log(sq);
			    console.log("SQ IS: " + sq +" END");
			    console.log("SQ OF SQINDEX IS" + sq[data.sqindex]);
			   out.sq[data.sqindex].ups=out.sq[data.sqindex].ups+1;
			    out.save(function(er){
				    if(er){
					console.log('ERROR ' + er);
				    }else{ // if everything went find
					//send a signal to all sockets (+1 up)
			       io.sockets.emit('studentQuestionReload',out.sq);
				    }
				});
			}
			else{ //if out is somehow null
			    console.log('ERROR out is null, line 60, app.js');
			}
		    });	
	    });
    });

app.engine('ejs',engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.logger('dev'));
app.use(express.cookieParser());
app.use(express.session({secret: 'thisisinfactathing'}));
app.use(express.bodyParser());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//Routes
app.get('/', routes.index);
//app.get('/partials/:name', routes.partials); // ANGULAR
app.post( '/create', routes.create); // from prof, makes session
app.post( '/join', routes.join); // from student, joins session
app.post( '/clicker_create', routes.clicker_make); // from prof, makes Q

//Routes that give Angular data
//Gives all student-submitted questions 
app.get('/getStudentQuestions', function(req,res){
	var code = req.code;
	Whiteboard.findOne({code:req.code}).exec(function(err, out){
		if(err)return console.log("ERROR: " + err);	
	return out.sq;
	    });	
    });

app.get('/', function(req,res){
	res.render('index');
    });
app.get('/whatis', function(req,res){
	res.render('whatis');
    });
app.get('/professor', function(req,res){
	res.render('professor');
    });
app.get('/student', function(req,res){
        res.render('student');
    });
app.get('/professorsession', function(req,res){
	res.render('professorsession', {session:req.session});
    });
app.get('/studentsession', function(req,res){
	res.render('studentsession', {session:req.session});
    });
app.get('/student_questions',function(req,res){
	res.render('student_questions', {session:req.session});
    });
app.get('/teacher_questions',function(req,res){
	res.render('teacher_questions', {session:req.session});
    });
app.get('/teacher_clicker', function(req,res){
	res.render('teacher_clicker', {session:req.session});
    });
app.get('/teacher_topics', function(req,res){
	res.render('teacher_topics', {session:req.session});
    });
app.get('/student_topics', function(req,res){
	res.render('student_topics', {session:req.session});
    });
app.get('/student_clicker', function(req,res){	
	Whiteboard.findOne(({code:req.session.code})).exec(function(err,out){
		if(err){
		    res.redirect('/studentsession');
		    console.log('ERROR: ' + err);
		}
		else if (out != null){
		    if(out.ccq != 0){
		    req.session.currentQindex=out.ccq-1;
		    req.session.currentQ=out.ccq-1;
		    req.session.q = out.cq[out.ccq-1].q;
		    req.session.o1 = out.cq[out.ccq-1].o1;
		    req.session.o2 = out.cq[out.ccq-1].o2;
		    req.session.o3 = out.cq[out.ccq-1].o3;
		    req.session.o4 = out.cq[out.ccq-1].o4;
		    }
		    res.render('student_clicker', {session:req.session});
		}else{
		    res.redirect('/studentsession', {session:req.session});
		    console.log('Could not find session by code');
		}
	    });
    });
app.get('/student_clicker_answeredA',function(req,res){
	Whiteboard.findOne({code:req.session.code}).exec(function(err,out){
		if(err){ res.redirect('/studentsession');
		    console.log('ERROR ' + err);
		}else if(out != null){
		    out.cq[req.session.currentQ].r1 = out.cq[req.session.currentQ].r1+1; // increment vote count by 1
		    out.save(function(err){
			    if(err){
				console.log('error' + err);
			    }
			});
		    req.session.pickedA = 1;
		    req.session.pickedB = 0;
		    req.session.pickedC = 0;
		    req.session.pickedD = 0;
		    res.render('student_clicker', {session:req.session});
		   }else{
		res.redirect('/student_session', {session:req.session});
		console.log('Could not find session by code');
		}
	    });
    });
app.get('/student_clicker_answeredB',function(req,res){
	Whiteboard.findOne({code:req.session.code}).exec(function(err,out){
		if(err){ res.redirect('/studentsession');
		    console.log('ERROR ' + err);
		}else if(out != null){
		    out.cq[req.session.currentQ].r2 = out.cq[req.session.currentQ].r2+1; // increment vote count by 1
		    out.save(function(err){
			    if(err){
				console.log('error' + err);
			    }
			});
		req.session.pickedA = 0;
		req.session.pickedB = 1;
		req.session.pickedC = 0;
		req.session.pickedD = 0;
		    res.render('student_clicker', {session:req.session});
		   }else{
		res.redirect('/student_session', {session:req.session});
		console.log('Could not find session by code');
		}
	    });
});
app.get('/student_clicker_answeredC',function(req,res){
	Whiteboard.findOne({code:req.session.code}).exec(function(err,out){
		if(err){ res.redirect('/studentsession');
		    console.log('ERROR ' + err);
		}else if(out != null){
		    out.cq[req.session.currentQ].r3 = out.cq[req.session.currentQ].r3+1; // increment vote count by 1
		    out.save(function(err){
			    if(err){
				console.log('error' + err);
			    }
			});
		req.session.pickedA = 0;
		req.session.pickedB = 0;
		req.session.pickedC = 1;
		req.session.pickedD = 0;
		    res.render('student_clicker', {session:req.session});
		   }else{
		res.redirect('/student_session', {session:req.session});
		console.log('Could not find session by code');
		}
	    });
});
app.get('/student_clicker_answeredD',function(req,res){
	Whiteboard.findOne({code:req.session.code}).exec(function(err,out){
		if(err){ res.redirect('/studentsession');
		    console.log('ERROR ' + err);
		}else if(out != null){
		    out.cq[req.session.currentQ].r4 = out.cq[req.session.currentQ].r4+1; // increment vote count by 1
		    out.save(function(err){
			    if(err){
				console.log('error' + err);
			    }
			});
	 	req.session.pickedA = 0;
		req.session.pickedB = 0;
		req.session.pickedC = 0;
		req.session.pickedD = 1;
		    res.render('student_clicker', {session:req.session});
		   }else{
		res.redirect('/student_session', {session:req.session});
		console.log('Could not find session by code');
		}
	    });
});
