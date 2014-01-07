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
	    if(err){res.redirect('/');}
	    if(out == null){
		new Whiteboard({
			code : req.body.code,
			name : req.body.name,
			students : 0
		    }).save( function ( err, arr, count ){
			    if( err ){ 
				console.log(err);
				return next( err );	   
			    }else{
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
		res.redirect('/studentsession');
	    }else{
		console.log('Session not found. Check code');
	    }
	}
    });
}