var express = require('express');
var router = express.Router();
var basic = require('./utils/basic');

/* GET users listing. */
router.get('/userinfo', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
