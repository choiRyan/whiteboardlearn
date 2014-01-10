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
			students : 0
		    }).save( function ( err, arr, count ){
			    if( err ){ 
				console.log("ERROR: " + err);
				return next( err );	   
			    }else{
				req.session.code = req.body.code;
				req.session.loggedin = true;
				req.session.professor = true;
				req.session.student = false;

				res.redirect( '/professorsession' );
			    }
			});
	    }else{res.redirect('/professor');} // code already in use
	});
};

//checks if code exists in database, and joins if so. else return '/'
exports.join = function(req,res,next){
    Whiteboard.findOne(({code:{$in: [req.body.code]}}), function(err, out){
	if(err){ res.redirect ('/');}
	else{
	    if(out != null){
		Whiteboard.update({code:req.body.code}, {$inc:{'students':1}}).exec();
		req.session.code = req.body.code;
		res.locals.class_code = req.body.code;
		res.locals.class_name = out.name;
		res.redirect('/studentsession');
	    }else{
		console.log('Session not found. Check code');
	    }
	}
    });
}

exports.clicker_make = function(req,res,next){
    console.log(req.session.code);
    console.log(req.body.q);
    console.log(req.body.op1);
    console.log(req.body.op2);
    console.log(req.body.op3);
    console.log(req.body.op4);
    Whiteboard.findOneAndUpdate(
    {code:req.body.code},
    {$push: {cq:
 	  {q:req.body.q, 
            o1:req.body.op1, r2:req.body.op2, o3:req.body.op3, o4:req.body.op4,
            r1:0, r2:0, r3:0, r4:0}
           }
    },
    {upsert:true},
    function(err){
	console.log("ERROR" + err);
	res.redirect('/professorsession');
    });
}