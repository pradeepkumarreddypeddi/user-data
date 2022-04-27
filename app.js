var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var {v4: uuidv4 } = require('uuid');
var alert= require('alert');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var MongoStore = require('connect-mongo');
var mongoose = require('mongoose');
var nodemailer= require('nodemailer');
var url = "mongodb://127.0.0.1:27017/projectdb";
var timestamp = require('timestamp');

var dbCon;
MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    console.log("Database created!");
    dbCon=db.db("projectdb");
  });




var app = express();
app.set('trust proxy', 1) 

app.use(
    session({
  genid: function(req) {
    return uuidv4(); 
  },
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: {maxAge : 6000000},
  store: MongoStore.create({
    mongooseConnection: dbCon,    
    host: '127.0.0.1', 
    port: '27017', 
    collectionName: 'sessions', 
    mongoUrl: 'mongodb://127.0.0.1:27017/projectdb'    
  })
}))
const myLogger = function (req, res, next) {
   // console.log('LOGGED')
    next()
  }
app.use(myLogger)

var indexRouter = require('./routes/index');
var homeRouter = require('./routes/home');
var usersRouter = require('./routes/users');
var logRouter=require('./routes/log');
var registerRouter =require('./routes/register');
const { ObjectID } = require('bson');
const multer =require('multer');
const aws= require('aws-sdk');
const jwt= require('jsonwebtoken');
const bcrypt =require('bcrypt');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');
app.set('view engine', 'ejs');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('./public'))


app.use('/users', usersRouter);
app.use("/",homeRouter);
app.use("/log",logRouter);
app.use("/register",registerRouter);


var un=""

// app.get('/', (req, res) => {
//     if( req.session.auth == true){
//         un=req.session.username
//         var obj={"username":un,"log":"login","ct":"","clock":""}
//         res.render("home",obj);
//         }
//         else{
//             var obj={"username":"Not Logged in","log":"Nologin","ct":"","clock":""}
//             res.render("home",obj);
//         }
// })



// app.get('/login', (req, res) => {
//     if(req.session.auth==true){
//         alert('Already logged in')
//         res.redirect("/");
//     }
//     else{
//     req.session.auth = false;
//     var ob={"obj":{}}
//     res.render("login",ob);
//     }
// })

// app.get('/logout', (req, res) => {
//     req.session.destroy(function(){
//         res.redirect('/login')
//     });     
//})

// app.post('/register', (req, res) => {
//     var udata={
//         "uid":req.body.uid,
//         "upd":req.body.upd,
//         "uph":req.body.uph,
//         "ub":req.body.ub,
//         "umail":req.body.umail,
       
//     }
    
//     const userprom=new Promise((resolve,reject)=>{
//         dbCon.collection("users").findOne({"uid":req.body.uid}, function(err, response) {
//             if(err) {reject(err)}
//             else    {resolve(response)} 
//         })
//     })  
    
//       userprom.then((userd)=>{
//         if(!userd){
//                 const uprom=new Promise((resolve,reject)=>{
//                     dbCon.collection("users").insertOne(udata,function(err, res1) {
//                         if(err) {reject(err)}
//                         else    { resolve(res1) }
//                     });
//                 })
//                 uprom.then((ud)=>{
//                     un=req.session.username;
//                     alert("succesfully registered");
//                     res.redirect("/login");
//                 })    
//             }
        

//         else if(userd){
//             const uprom=new Promise((resolve,reject)=>{
//                 dbCon.collection("users").updateOne({"uid":udata.uid},{$set:udata},function(err, res1) {
//                     if(err) {reject(err)}
//                     else    { resolve(res1) }
//                 });
//             })
//             uprom.then((ud)=>{
//                 un=req.session.username;
//                 alert("succesfully register updated");
//                 res.redirect("/");
//             }) 
//         }
//         else{

//             alert("already registered");
//             res.redirect("/login");
//         } 
//       })  
// })
app.get('/rdata', (req, res) => {
    if( req.session.auth == true){
    dbCon.collection("employees").find({}).toArray(function(err, result) {
        if (err) throw err;
        
        un=req.session.username;
        
        var dobj = { "darr": result,"username":un };
        res.render("rdata", dobj);
    });
    }
    else{
        res.send("invalid user")
    }
})

app.get('/leave', (req, res) => {
    if(req.session.username){
    un=req.session.username;
    var ob={"obj":{},"username":un};
    res.render("leave",ob)
    }
    else{
        res.redirect("/log/in")
    }

})

app.post('/apply', (req, res) => {
    var udata={
        "uid":req.body.uid,
        "reason":req.body.reason,
        "fdate":req.body.fdate,
        "tdate":req.body.tdate,
        "type":req.body.type
    }
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'uiop2216@gmail.com',
          pass: '9908939412p'
        },
        tls: {
            rejectUnauthorized: false
        }
      });
      
      var mailOptions = {
        from: 'uiop2216@gmail.com',
        to: 'pradeep.p@darwinbox.io',
        subject: 'Leave application',
        text:'Type: '+udata.type+"       from: "+udata.fdate+"       to: "+udata.tdate+'              Reason: '+udata.reason
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent successfully');
          alert("your leave sent to your manager successfully");
          res.redirect("/")
        }
      });

    }); 

app.get('/taskveiw', (req, res) => {
        if( req.session.auth == true){
        dbCon.collection("tasks").find({}).toArray(function(err, result) {
            if (err) throw err;
            un=req.session.username;
            
            var dobj = { "tdata": result,"username":un };
            res.render("alltasks", dobj);
        });
        }
        else{
            res.send("invalid user")
        }
})    
app.get('/addtask', (req, res) => {
    if(req.session.username){
    un=req.session.username;
    var ob={"obj":{},"username":un};
    res.render("task",ob)
    }
    else{
        res.redirect("/log/in")
    }

})
app.post('/edittask', (req, res) => {
    var tdata={
        "uid":un,
        "tn":req.body.tn,
        "tdate":req.body.tdate,
        "rem":req.body.rem,
        "details":req.body.details,
        "done":req.body.done,
        "prog":req.body.prog
    }
    
    dbCon.collection("tasks").findOne({"tn":tdata.tn},function(err,res1){
        if(res1){
            dbCon.collection("tasks").updateOne({"tn":tdata.tn},{$set:tdata}, function(err, res2) {
                if(err) throw err;
                else{
                res.redirect("/taskveiw")
                }
            })
        }
        else{
            dbCon.collection("tasks").insertOne(tdata, function(err, res2) {
                if(err) throw err;
                else{
                    res.redirect("/taskveiw")
                }
            })
        }
    })
})

app.get('/com/:tid', (req, res) => {
    
    if(req.session.auth){
        var kid=req.params.tid;
        dbCon.collection("tasks").deleteOne({"_id":ObjectId(kid)},function(err,res1){
            if(err) throw err;
            else{
                res.redirect("/taskveiw");
            }
        })
    }
})

app.get('/veiwtask/:tid', (req, res) => {
    
    if(req.session.auth){
        var kid=req.params.tid;
    
        async function edd(){
            var findt=await dbCon.collection("tasks").findOne({"_id":ObjectID(kid)});
            var obj={"username":un,"obj":findt};
            res.render("task",obj);
        }
        edd();
        }
        else{
            res.send("invalid user for edit");
        }  
})  



app.get('/edit/:eid', (req, res) => {
    
    if(req.session.auth){
    var kid=req.params.eid;

    async function edd(){
        var findemp=await dbCon.collection("employees").findOne({"_id":ObjectID(kid)});
        var finddep=await dbCon.collection("departments").find({}).toArray();
        var obj={"username":un,"edata":findemp,"dep":finddep};
        res.render("form",obj);
    }
    edd();
    }
    else{
        res.send("invalid user for edit");
    }

})

app.get('/delete/:eid', (req, res) => {
    if(req.session.auth){
    var kid=req.params.eid;

    async function deld(){
    await dbCon.collection("employees").deleteOne({"_id":ObjectID(kid)});
        res.redirect("/rdata")
        alert('Successfully deleted')
    }
    deld();
    }
    else{
        res.send("invalid user for deletion");
    }
})


app.get('/add', (req, res) => {
    if( req.session.auth == true){
        un=req.session.username

        async function addfun(){
        var resdep=await dbCon.collection("departments").find({}).toArray()
        var obj={"username":un,"edata":{},"dep":resdep}
        res.render("form",obj);
    }
    addfun();
    }
        else{
            res.send("Invalid user")
        }
})


app.get('/veiw', (req, res) => {
    if( req.session.auth == true){
        un=req.session.username

        async function addfun(){
            var finduser=await dbCon.collection("users").findOne({"uid":un});  
            var obj={"username":un,"obj":finduser}
        res.render("details",obj);
    }
    addfun();
    }
        else{
            res.send("Invalid user")
        }
})

app.get('/help', (req, res) => {
    res.redirect("https://darwinbox.com")
})

app.get('/reg', (req, res) => {
    var ob={"obj":{}};
    res.render("register",ob)

})


app.get('/forgot', (req, res) => {
    var ob={"obj":{}}
    res.render("forgot",ob)      
})

app.post('/ret',(req,res)=>{
    
    dbCon.collection("users").findOne({"uid":req.body.username,"uph":req.body.uph,"ub":req.body.ub}, function(err, res1) {
        if (err) throw err;
        if(res1){
            console.log(res1)
            var ob={"obj":res1}

            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: 'uiop2216@gmail.com',
                  pass: '9908939412p'
                },
                tls: {
                    rejectUnauthorized: false
                }
              });
              
              var mailOptions = {
                from: 'uiop2216@gmail.com',
                to: res1.umail,
                subject: 'Forgot Password',
                text:'your password is:'+res1.upd
              };
              
              transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent successfully');
                  alert("your password sent to your email successfully");
                  res.redirect("/log/in")
                }
              });
            
        }
        else{
            alert("Wrong User details");
            res.redirect("/forgot");
        }
    });
})

app.get('/cp', (req, res) => {
    un=req.session.username
    var ob={"obj":{},"username":un}
    res.render("cp",ob)      
})
app.post('/changepass',(req,res)=>{
    dbCon.collection("users").findOne({"uid":req.body.username,"uph":req.body.uph,"ub":req.body.ub}, function(err, res1) {
        if (err) throw err;
        if(res1){
            res1.upd=req.body.password
            var ob={"obj":res1}
        dbCon.collection("users").updateOne({"_id":ObjectId(res1._id)},{$set:res1}, function(err, response) {
                if (err) throw err;
                res.redirect("/")
                alert('Successfully changed password')
              });
        }
        else{
            alert("Wrong User details");
            res.redirect("/cp");
        }
      });
})

app.get('/form', (req, res) => {
    if( req.session.auth == true){
    un=req.session.username
    var obj={"username":un,"edata":edata}
    res.render("form",obj);
    }
    else{
        res.send("Invalid user")
    }
})
var c="";
app.get('/cin', (req, res) => {
    if( req.session.auth == true){
     c=1;
     
     var cin=new Date(timestamp());
     var cdata={
         "clock in":cin
     }
     un=req.session.username
     var obj={"username":un,"log":"login","ct":cin,"clock":"Clock in at:"}
     dbCon.collection("users").updateOne({"uid":un},{$set:cdata}, function(err, response) {
     res.render("home",obj);
     })
    }

})  
app.get('/cout', (req, res) => {
    if( req.session.auth == true){
          
     var cout=new Date(timestamp());
     var cdata={
        "clock out":cout
    } 
     un=req.session.username
     dbCon.collection("users").updateOne({"uid":un},{$set:cdata}, function(err, response) {
     var obj={"username":un,"log":"login","ct":cout,"clock":"Clock out at"}
     res.render("home",obj);
     })
    }

})    




app.post('/validate', (req, res) => {
   
        dbCon.collection("users").findOne({"uid":req.body.username}, function(err, response) {
                if (err) throw err;
                if(response){
                    async function auth(){
                        const auth=await bcrypt.compare(req.body.password,response.upd);
                        if(auth){
                            req.session.auth = true; 
                            un=req.body.username;
                            req.session.username=req.body.username;
                            jwt.sign({response}, 'secretkey', (err, token) => {
                                res.cookie("jwt",token,{
                                  })
                                res.redirect('/');
                                
                              });
                        }
                        else{
                            res.redirect("/reg"); 
                        }
                    }auth();
                }
                else{
                    res.redirect("/reg");
                }
              });
})
 

app.post('/save', (req, res) => {
     if(req.session.auth){

         var t=Date(timestamp);
         console.log("here"+t);
        var data={
            "empname":req.body.employeename,
            "empb":req.body.employeebrowser,
            "empp":req.body.employeeplatform,
            "empid":req.body.employeeid,
            "empbatch":req.body.employeebatch,
            "did":req.body.dep,
            "ckbox":req.body.checkbox,
            "lastmodified":t,
            "latmodified by":un
        };
        if(req.body.kid){
            if(req.body.newr !=""){
                dbCon.collection("departments").find({}).toArray(function(err, resdep) {
                    var datar={
                       "name":req.body.newr,
                       "ind":resdep.length
                    }
                console.log(datar)
                data.did=resdep.length
                    dbCon.collection("departments").insertOne(datar, function(err, response) {
                        alert("data dep inserted")   
                            dbCon.collection("employees").updateOne({"_id":ObjectId(req.body.kid)},{$set:data}, function(err, response) {
                                if (err) throw err;
                                console.log("1 document updated");
                                res.redirect("/rdata")
                                alert('Successfully edited')
                            });
                    })
                })
            }
            else{
                dbCon.collection("employees").updateOne({"_id":ObjectId(req.body.kid)},{$set:data}, function(err, response) {
                    if (err) throw err;
                    console.log("1 document updated");
                    res.redirect("/rdata")
                    alert('Successfully edited')
                });
                var timestamp = require('timestamp')

            }
        }
        else{
            if(req.body.newr !=""){
                dbCon.collection("departments").find({}).toArray(function(err, resdep) {
                    var datar={
                       "name":req.body.newr,
                       "ind":resdep.length
                    }
                data.did=resdep.length
            dbCon.collection("departments").insertOne(datar, function(err, response) {
                    alert("data dep inserted")
            dbCon.collection("employees").insertOne(data, function(err, response) {
                if (err) throw err;
                res.redirect("/rdata")
                alert('Successfully inserted/role')
            })    
            })
            });
            }
            else{
            dbCon.collection("employees").insertOne(data, function(err, response) {
                if (err) throw err;
                res.redirect("/rdata")
                alert('Successfully inserted')
            });
            }
        }
     }
     else{
         res.redirect("/log/in");
     }
 
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;