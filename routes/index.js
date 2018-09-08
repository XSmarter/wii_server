var express = require('express');
var router = express.Router();
var basic = require('./utils/basic');


/* GET home page. */
router.post('/test', function(req, res, next) {
    res.json({test:123});
});

module.exports = router;
