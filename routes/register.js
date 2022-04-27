var express = require('express');
var router = express.Router();
var path = require('path');
var alert= require('alert');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://127.0.0.1:27017/mydb";

var dbCon;
MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    dbCon=db.db("mydb");
  });

/* post register page. */
router.post('/', function(req, res, next) {
    var udata={
        "uid":req.body.uid,
        "upd":req.body.upd,
        "uph":req.body.uph,
        "ub":req.body.ub,
        "umail":req.body.umail,
       
    }
    
    const userprom=new Promise((resolve,reject)=>{
        dbCon.collection("users").findOne({"uid":req.body.uid}, function(err, response) {
            if(err) {reject(err)}
            else    {resolve(response)} 
        })
    })  
    
      userprom.then((userd)=>{
        if(!userd){
                const uprom=new Promise((resolve,reject)=>{
                    dbCon.collection("users").insertOne(udata,function(err, res1) {
                        if(err) {reject(err)}
                        else    { resolve(res1) }
                    });
                })
                uprom.then((ud)=>{
                    un=req.session.username;
                    alert("succesfully registered");
                    res.redirect("/log/in");
                })    
            }
        

        else if(userd){
            const uprom=new Promise((resolve,reject)=>{
                dbCon.collection("users").updateOne({"uid":udata.uid},{$set:udata},function(err, res1) {
                    if(err) {reject(err)}
                    else    { resolve(res1) }
                });
            })
            uprom.then((ud)=>{
                un=req.session.username;
                alert("succesfully register updated");
                res.redirect("/");
            }) 
        }
        else{

            alert("already registered");
            res.redirect("/log/in");
        } 
      })
});

module.exports = router;
