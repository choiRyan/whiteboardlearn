require('./db');

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var app = express();
var engine = require('ejs-locals');
var io = require('socket.io');

// all environments
app.set('port', process.env.PORT || 8080);
var server = http.createServer(app);
io = io.listen(server);

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

app.locals({code:"",name:""});

//Routes
app.get('/', routes.index);
app.post( '/create', routes.create); // from prof, makes session
app.post( '/join', routes.join); // from student, joins session
app.post( '/clicker_create', routes.clicker_make); // from prof, makes Q
//app.post( '/sclicker_get', routes.sclicker_get); //gives Q to students
//app.post( '/clicker_answer_click', routes.clicker_answer_a); //student answers

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

	console.log(req.session);
	res.render('student_clicker', {session:req.session});
    });