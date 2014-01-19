var utils    = require( '../node_modules/express/lib/utils.js' );
var c_utils = require('../node_modules/express/node_modules/connect/lib/utils.js');
var mongoose = require( 'mongoose' );
var Whiteboard     = mongoose.model( 'Whiteboard' );  

exports.index = function ( req, res, next ){
  Whiteboard.
  find().
  exec( function ( err, whiteboards ){
	  if( err ) return next( err );
	  
	  res.render( 'index', {
		  title : 'Express Whiteboard Example',
		      whiteboards : whiteboards
		      });
      });
};

exports.create = function ( req, res, next ){
    Whiteboard.findOne(({code:req.body.code}),function(err,out){
	    if(err){res.redirect('/professor#error');}
	    if(out == null){
		new Whiteboard({
			code : req.body.code,
			name : req.body.name,
			students : 0,
			ccq : 0
		    }).save( function ( err, arr, count ){
			    if( err ){ 
				console.log("ERROR: " + err);
				return next( err );	   
			    }else{
				req.session.code = req.body.code;
				req.session.loggedin = true;
				req.session.professor = true;
				req.session.student = false;
				req.session.name = req.body.name;
				res.redirect( '/professorsession' );
			    }
			});
	    }else{ // of the session is taken but the name matches, send next.
		if(req.body.name == out.name){
		    req.session.code = req.body.code;
		    req.session.name = req.body.name;
		    //save cookie data for prof; prof can't also be a student
		    res.cookie('code', req.body.code, { expires: new Date(Date.now() + 24*60*60*1000), path: '/' });
		    res.cookie('name', req.body.name, { expires: new Date(Date.now() + 24*60*60*1000), path: '/' });
		    res.cookie('loggedin', 1, { expires: new Date(Date.now() + 24*60*60*1000), path: '/' });
		    res.cookie('professor', 1, { expires: new Date(Date.now() + 24*60*60*1000), path: '/' });
		    res.cookie('student', 0, { expires: new Date(Date.now() + 24*60*60*1000), path: '/' });
		    req.session.msg = "";
		    res.redirect('/professorsession');
		}else{
		    req.session.msg = "Code is in use; course name does not match current session name";
		    res.redirect('/professor');
		}
	    }
	});
};

//checks if code exists in database, and joins if so. else return '/'
exports.join = function(req,res,next){
    Whiteboard.findOne(({code:{$in: [req.body.code]}}), function(err, out){
	if(err){ res.redirect ('/students');}
	else{
	    if(out != null){
		Whiteboard.update({code:req.body.code}, {$inc:{'students':1}}).exec();
		req.session.code = req.body.code;
		req.session.name = out.name;
		res.cookie('code', req.body.code, { expires: new Date(Date.now() + 24*60*60*1000), path: '/' });
		res.cookie('name', req.body.name, { expires: new Date(Date.now() + 24*60*60*1000), path: '/' });
		res.cookie('loggedin', 1, { expires: new Date(Date.now() + 24*60*60*1000), path: '/' });
		res.cookie('professor', 0, { expires: new Date(Date.now() +24*60*60*1000), path: '/' });
		res.cookie('student', 1, { expires: new Date(Date.now() + 24*60*60*1000), path: '/' });
		req.session.msg = "";
		res.redirect('/studentsession');
	    }else{
		req.session.msg = "Session not found. Your code could be wrong, or the class session has expired.";
		res.redirect('/student');
	    }
	}
    });
};
