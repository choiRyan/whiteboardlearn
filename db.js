var mongoose = require( 'mongoose' );
var Schema   = mongoose.Schema;
 
var Whiteboard = new Schema({
	code : String,
	name : String,
	students : Number
    });

mongoose.model( 'Whiteboard', Whiteboard );
mongoose.connect( 'mongodb://localhost/Whiteboard' );