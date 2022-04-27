var express = require('express');
var router = express.Router();
var path = require('path');
var alert= require('alert');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://127.0.0.1:27017/projectdb";
const multer =require('multer');
const aws= require('aws-sdk');
const jwt= require('jsonwebtoken');
const bcrypt =require('bcrypt');

var dbCon;
MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    dbCon=db.db("projectdb");
  });


  const storage=multer.diskStorage({
    destination:function(request,file,callback){
        callback(null,'./public/images');
    },
    filename:function(request,file,callback){
        callback(null,file.originalname);
    },
});

const upload=multer({
    storage:storage,
    limits:{
        fieldSize:1024*1024*3,
    },
})
/* post register page. */
router.post('/',upload.single('photo'),async function(req, res, next) {
    var udata={
        "uid":req.body.uid,
        "upd":req.body.upd,
        "uph":req.body.uph,
        "ub":req.body.ub,
        "umail":req.body.umail,
       // "photo":req.file.filename,
       
    }

    const salt =await bcrypt.genSalt();
    const psd=await bcrypt.hash(req.body.upd,salt); 
    udata.upd=psd;
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
