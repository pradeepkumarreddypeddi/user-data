var express = require('express');
var app = express.Router();
var path = require('path');
var alert= require('alert');

app.get('/in', function(req, res, next) {
    if(req.session.auth==true){
        alert('Already logged in')
        res.redirect("/");
    }
    else{
    req.session.auth = false;
    var ob={"obj":{}}
    res.render("login",ob);
    }
})
app.get('/out', function(req, res, next) {
    req.session.destroy(function(){
        res.redirect('/')
    });
})



module.exports = app;
