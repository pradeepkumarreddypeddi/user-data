var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if( req.session.auth == true){
         un=req.session.username
         var obj={"username":un,"log":"login","ct":"","clock":""}
             res.render("home",obj);
             }
             else{
                var obj={"username":"Not Logged in","log":"Nologin","ct":"","clock":""}
                 res.render("home",obj);
             }
});

module.exports = router;
