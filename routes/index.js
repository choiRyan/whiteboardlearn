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
	new Whiteboard({
		code : req.body.code,
		name : req.body.name,
		students : 0
	    }).save( function ( err ){
		    
		    if( err ){ 
			console.log(err);
			return next( err );	   
		    }else{
			res.redirect( '/professorsession' );
		    }
		});
};

//checks if code exists in database, and joins if so. else return '/'
exports.join = function(req,res,next){
    Whiteboard.find(
    {'code':req.body.code}
    ), function(err, whiteboard){
	console ('worked');

	if(err) res.redirect ('/');
	else{
	    Whiteboard.update({'code':req.body.code}, {$inc:{'students':1}});
     	    res.redirect('/studentsession');
	}
    }
    next();
}