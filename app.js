require('./db');

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var app = express();
var engine = require('ejs-locals');
var mongoose = require( 'mongoose' );
var Whiteboard     = mongoose.model( 'Whiteboard' ); 

// all environments
app.set('port', process.env.PORT || 8080);
var server = http.createServer(app);

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
app.post( '/create', routes.create); // from prof, makes session
app.post( '/join', routes.join); // from student, joins session
app.post( '/clicker_create', routes.clicker_make); // from prof, makes Q

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
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
app.get('/teacher_clicker', function(req,res){
	res.render('teacher_clicker', {session:req.session});
    });
app.get('/student_clicker', function(req,res){	
	Whiteboard.findOne(({code:req.session.code})).exec(function(err,out){
		if(err){
		    res.redirect('/studentsession');
		    console.log('ERROR: ' + err);
		}
		else if (out != null){
		    req.session.currentQindex=out.ccq-1;
		    req.session.currentQ=out.ccq-1;
		    req.session.q = out.cq[out.ccq-1].q;
		    req.session.o1 = out.cq[out.ccq-1].o1;
		    req.session.o2 = out.cq[out.ccq-1].o2;
		    req.session.o3 = out.cq[out.ccq-1].o3;
		    req.session.o4 = out.cq[out.ccq-1].o4;
		    res.render('student_clicker', {session:req.session});
		}else{
		    res.redirect('/studentsession', {session:req.session});
		    console.log('Could not find session by code');
		}
	    });
    });
app.get('/student_clicker_answeredA',function(req,res){
	Whiteboard.findOne({code:req.session.code}).exec(function(err,out){
		req.session.pickedA == 1;
		req.session.pickedB == 0;
		req.session.pickedC == 0;
		req.session.pickedD == 0;
		if(err){ res.redirect('/studentsession');
		    console.log('ERROR ' + err);
		}else if(out != null){
		    console.log(out.cq[req.session.currentQ].r1);
		    out.cq[req.session.currentQ].r1 = out.cq[req.session.currentQ].r1+1; // increment vote count by 1
		    out.save(function(err){
			    if(err){
				console.log('error' + err);
			    }
			});
		    res.render('student_clicker', {session:req.session});
		   }else{
		res.redirect('/student_session', {session:req.session});
		console.log('Could not find session by code');
		}
	    });
    });
app.get('/student_clicker_answeredB',function(req,res){
	Whiteboard.findOne({code:req.session.code}).exec(function(err,out){
		req.session.pickedA == 0;
		req.session.pickedB == 1;
		req.session.pickedC == 0;
		req.session.pickedD == 0;
		if(err){ res.redirect('/studentsession');
		    console.log('ERROR ' + err);
		}else if(out != null){
		    console.log(out.cq[req.session.currentQ].r2);
		    out.cq[req.session.currentQ].r2 = out.cq[req.session.currentQ].r2+1; // increment vote count by 1
		    out.save(function(err){
			    if(err){
				console.log('error' + err);
			    }
			});
		    res.render('student_clicker', {session:req.session});
		   }else{
		res.redirect('/student_session', {session:req.session});
		console.log('Could not find session by code');
		}
	    });
});
app.get('/student_clicker_answeredC',function(req,res){
	Whiteboard.findOne({code:req.session.code}).exec(function(err,out){
		req.session.pickedA == 0;
		req.session.pickedB == 0;
		req.session.pickedC == 1;
		req.session.pickedD == 0;
		if(err){ res.redirect('/studentsession');
		    console.log('ERROR ' + err);
		}else if(out != null){
		    console.log(out.cq[req.session.currentQ].r3);
		    out.cq[req.session.currentQ].r3 = out.cq[req.session.currentQ].r3+1; // increment vote count by 1
		    out.save(function(err){
			    if(err){
				console.log('error' + err);
			    }
			});
		    res.render('student_clicker', {session:req.session});
		   }else{
		res.redirect('/student_session', {session:req.session});
		console.log('Could not find session by code');
		}
	    });
});
app.get('/student_clicker_answeredD',function(req,res){
	Whiteboard.findOne({code:req.session.code}).exec(function(err,out){
		req.session.pickedA == 0;
		req.session.pickedB == 0;
		req.session.pickedC == 0;
		req.session.pickedD == 1;
		if(err){ res.redirect('/studentsession');
		    console.log('ERROR ' + err);
		}else if(out != null){
		    console.log(out.cq[req.session.currentQ].r4);
		    out.cq[req.session.currentQ].r4 = out.cq[req.session.currentQ].r4+1; // increment vote count by 1
		    out.save(function(err){
			    if(err){
				console.log('error' + err);
			    }
			});
		    res.render('student_clicker', {session:req.session});
		   }else{
		res.redirect('/student_session', {session:req.session});
		console.log('Could not find session by code');
		}
	    });
});
