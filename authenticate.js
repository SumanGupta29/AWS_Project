const User = require("./models/users")

var authenticateUser = {};

authenticateUser.isLoggedin = function(req, res, next) {
  if(req.isAuthenticated()){
    return next();
  } else {
    return res.redirect("/login");
  }
}

authenticateUser.isCounsellor = function(req, res, next) {
  if(req.isAuthenticated()){
    if(req.user.counsellor == "Yes"){
      return next();
    } else {
      console.log(req.user.counsellor);
      res.redirect("back");
    }
  } else {
    res.redirect("/")
  }
}

module.exports = authenticateUser;
