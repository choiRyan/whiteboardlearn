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
        var workingWith = out;
        if(err)console.log(err);
        else if(out != null){ 
	    Whiteboard.findOneAndUpdate({code:req.session.code},{$push: {cq:{q:req.body.q, id: out.ccq,	o1:req.body.op1, o2:req.body.op2, o3:req.body.op3, o4:req.body.op4,r1:0, r2:0, r3:0, r4:0}
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
};
