exports.index(req,res){
    res.render('/');
};

exports.studentform(req,res){
    //do function to check if the codes match req.body.code;
    

    //render the next page if successful, else back to orig
    res.render('/studentsession');
});