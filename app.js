const express = require('express')
const { isLoggedin, isCounsellor } = require('./authenticate')
      bodyParser =  require('body-parser')
      mongoose = require('mongoose')
      passport = require('passport')
      flash = require('connect-flash')
      LocalStrategy = require('passport-local')
      methodOverride = require('method-override')
      multer = require('multer')
      path = require('path')
      app = express()
      User = require("./models/users")
      CallRequest = require("./models/call_request")

storage = multer.diskStorage({destination:"./public/uploads", filename:function(req, file, cb) {cb(null, file.fieldname+"_"+Date.now()+path.extname(file.originalname))}})
upload = multer({storage:storage}).single("image")
mongoose.connect("mongodb://localhost/career_guidance", {useNewUrlParser:true, useUnifiedTopology:true})
mongoose.set("useCreateIndex", true)
mongoose.set("useFindAndModify", false)

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static(__dirname + '/public'))
app.use(methodOverride('_method'))
app.use(flash())
app.use(require('express-session')({
    secret: 'Option',
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next)=>{
    res.locals.currentUser = req.user
    res.locals.error = req.flash('error')
    res.locals.success = req.flash('success')
    next()
});

app.get("/",(req, res)=>{
    res.render("landing");
});

app.get("/request_call", isLoggedin, (req, res) => {
    res.render("/");
});

app.post("/request_call/:id", isLoggedin, (req, res) => {
    var user_id = req.params.id;
    var name = req.body.name;
    var email = req.body.email;
    var phone = req.body.phone;
    var needHelpIn = req.body.help;
    var role = req.body.role;
    console.log(user_id, name, email, needHelpIn, phone, role);

    var CallRequestData = new CallRequest({
        user_id : user_id,
        name : name,
        email : email,
        phone : phone,
        needHelpIn : needHelpIn,
        role : role
    });

    CallRequest.create(CallRequestData, (err, registeredRequest) => {
        if(err){
            console.log(CallRequestData);

            console.log("Call request is unsuccessful...");
            console.log(err);
            res.render("landing");
        }
        else{
            console.log("Successfully registered a call request...");
            res.render("landing");
        }
    });
});

app.get("/request_status/:id", (req,res)=>{
    console.log(req.params.id);
    CallRequest.find({user_id : req.params.id}, (err, reqstats) => {
        var reqstatsflag = 1;
        if(reqstats == ""){
            reqstatsflag = 0;
            res.render("request_status", {reqstatsflag : reqstatsflag});
        }else{
            res.render("request_status", {reqstats : reqstats, reqstatsflag : reqstatsflag});
        }
        
    });
});

app.get("/counsellor_panel", isLoggedin, isCounsellor, (req, res) => {
    CallRequest.find({status:"Pending"}, (err, call_req) => {
        if(err){
            console.log("Oops! no request available");
            res.render("counsellor_panel");
        }
        else{
            res.render("counsellor_panel", {call_req : call_req});
        }
    });
});

app.get("/accepted_requests", isLoggedin, isCounsellor, (req, res) => {
    CallRequest.find({status:"Accepted"}, (err, acc_req)=>{
        if(err){
            console.log(err);
        } else {
            res.render("accepted_requests", {acc_req : acc_req});
        }
    });
});

app.get("/accepted_requests/:id", isLoggedin, isCounsellor, (req, res)=>{
    CallRequest.findById(req.params.id, (err, accepted_req)=>{
        if(err){
            console.log(err);
            res.render("counsellor_panel");
        } else {
            CallRequest.findOneAndUpdate({_id : req.params.id}, {$set : {status:"Accepted"}}, (err, status_changed)=>{
                if(err){
                    console.log(err);
                } else{
                    console.log(accepted_req);
                }
            });
        }
    });
    res.render("accepted_requests");
});

app.get("/after_10th",(req,res) => {
    res.render("after___/after10th/after_10th");
});

app.get("/after_10th_intermediate", (req,res) => {
    res.render("after___/after10th/after_10th_intermediate");
});

app.get("/after_10th_science", (req,res) => {
    res.render("after___/after10th/after_10th_science");
});

app.get("/after_10th_ITI", (req,res) => {
    res.render("after___/after10th/after_10th_ITI");
});

app.get("/after_10th_other", (req,res) => {
    res.render("after___/after10th/after_10th_other");
});

app.get("/after_10th_paramedical", (req,res) => {
    res.render("after___/after10th/after_10th_paramedical");
});

app.get("/after_10th_polytechnique", (req,res) => {
    res.render("after___/after10th/after_10th_polytechnique");
});

app.get("/after-12_courses",(req,res) => {
    res.render("after___/after12th");
});

app.get("/after_graduation",(req,res) => {
    res.render("after___/afterGraduation/after_graduation");
});

app.get("/engg_graduation",(req,res) => {
    res.render("after___/afterGraduation/engg_graduation");
});

app.get("/graduation_exams",(req,res) => {
    res.render("after___/afterGraduation/graduation_exams");
});

app.get("/register",(req, res)=>{
    res.render("register");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    }), function(req, res){}
);

app.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Logged you out");
    res.redirect("/");
});

app.post("/register",(req, res) => {
    var fullname = req.body.fullname;
    var username = req.body.email;
    var password = req.body.password1;
    var password2 = req.body.password2;
    var counsellor = req.body.counsellor;
    var degree = req.body.degree;
    if(counsellor == null){
        counsellor = 'No';
    }

    var newUser = new User({fullname : fullname, username : username, counsellor : counsellor, degree : degree});
    User.register(newUser, password, function(err, user){
        if(err){
          console.log(err);
          return res.redirect("/register");
        }
        passport.authenticate("local", {
          successRedirect: "/login",
          failureRedirect: "/register",
        })(req, res);
      });
});

app.listen(8080,()=>{
    console.log("running on port 8080...");
});