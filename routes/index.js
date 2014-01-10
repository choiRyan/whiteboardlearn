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
    //TODO check if string code has already been taken
    Whiteboard.findOne(({code:req.body.code}),function(err,out){
	    if(err){res.redirect('/professor#CodeTaken');}
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
	    }else{res.redirect('/professor');} // code already in use
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
		req.session.professor = false;
		req.session.student = true;
		req.session.loggedin = true;
		//res.locals.class_code = req.body.code;
		//res.locals.class_name = out.name;
		//console.log("name: " +res.locals.class_name+ " | code : " +res.locals.class_code); 
		res.redirect('/studentsession');
	    }else{
		console.log('Session not found. Check code');
		res.redirect('/student');
	    }
	}
    });
}

exports.clicker_make = function(req,res,next){
    Whiteboard.findOne({code:req.session.code},function(err,out){
	    if(err)console.log(err);
	    else if(out != null){ 
		Whiteboard.update({ccq:out.ccq+1}).exec();	
		Whiteboard.findOneAndUpdate(
					    {code:req.session.code},
					    {$push: {cq:
						    {
							q:req.body.q, id: out.ccq,
							    o1:req.body.op1, o2:req.body.op2, o3:req.body.op3, o4:req.body.op4,
							    r1:0, r2:0, r3:0, r4:0}
						}
					    },
					    {upsert:false},
					    function(err){
						if(err){
						    console.log("ERROR" + err);
						}else{
						    Whiteboard.update({code:req.session.code},{$inc:{'ccq':1}}).exec();
						    res.redirect('/professorsession');
						}
					    });
	    }
	});
}
  
exports.sclicker_get = function(req,res,next){
    Whiteboard.findOne(({code:req.session.code})).exec(function(err,out){
	    if(err){
		res.redirect('/studentsession');
		console.log('ERROR: ' + err);
	    }
	    else if (out != null){
		console.log(out);
		console.log(out.ccq-1);
		console.log(out.cq[out.ccq-1]);
		req.session.q = out.cq[out.ccq-1].q;
		req.session.o1 = out.cq[out.ccq-1].o1;
		req.session.o2 = out.cq[out.ccq-1].o2;
		req.session.o3 = out.cq[out.ccq-1].o3;
		req.session.o4 = out.cq[out.ccq-1].o4;
		res.redirect('/student_clicker');
	    }else{
	        res.redirect('/studentsession');
		console.log('Could not find session by code');
	    }
    });
}
