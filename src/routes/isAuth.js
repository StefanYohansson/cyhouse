var express = require('express');
var router = express.Router();

router.post('/', function(req, res) {
  var isAuth = req.isAuthenticated()
  if(req.isAuthenticated()) res.send({ auth: true, name: req.user.name });
  else res.send({ auth: false });

});

module.exports = router;
