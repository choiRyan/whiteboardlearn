var mongoose = require( 'mongoose' );
var Schema   = mongoose.Schema;
 
var Whiteboard = new Schema({
	code : String,
	name : String,
	students : Number,
	ccq : Number,
	cq : [{id:Number, q:String, o1:String, o2:String, o3:String, o4:String, r1:Number, r2:Number, r3:Number, r4:Number}], 
	//clicker questions : question options responseCount
	sq : [{ q:String, ups:Number}],
	//student questions : question, upvotes
	tq : [{ t:String, dist:[Number]}]
	//teacher questions : topic, distribution
    });

mongoose.model( 'Whiteboard', Whiteboard );
mongoose.connect( 'mongodb://localhost/Whiteboard' );