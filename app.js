var createError = require('http-errors');
var express = require('express');
var logger = require('morgan');
var jwt = require('jsonwebtoken');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var basic = require('./routes/utils/basic');


var app = express();

// 设置superSecret 全局参数
app.set('superSecret', "myjwttokeninfo");

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));


// 添加跨域请求支持
app.all("*", function (req, res, next) {
  res.header("Access-Control-Allow-Credentials", true);
  res.header('Access-Control-Allow-Origin', '*');
  res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length,Authorization,Accept,X-Requested-With,x-access-token");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By", ' 3.2.1');
  res.header("Content-Type", "application/json;charset=utf-8");
  console.log(req.method);
  if(req.method === "OPTIONS"){
    res.send(200);
  }else{
    next();
  }
});

//jwt token授权部分
app.all('/authorize', function(req, res, next) {
  basic.dbHelper('select name,password from wii_user_info where name = ?',[req.body.name || req.query.name],function(err,rows){
    if(err){
      return res.json({
        success: false,
        message: err
      });
    }else{
      if(!rows.length){
        res.json({ success: false, message: '未找到授权用户' });
      }else if(rows[0]){
        var user = rows[0];
        var password = req.body.password || req.query.password || '';
        if(user.password != password){
          res.json({ success: false, message: '用户密码错误' });
        }else{
          // user必须是对象
          var token = jwt.sign(user, app.get('superSecret'), {
            expiresIn : 60*60*24// 授权时效24小时
          });
          res.json({
            success: true,
            message: '请使用您的授权码',
            token: token
          });
        }
      }
    }
  });
});

// 添加Token验证支持
app.all("*", function (req, res, next) {
  // 拿取token 数据 按照自己传递方式写
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  console.log(token);
  if (token) {
    // 解码 token (验证 secret 和检查有效期（exp）)
    jwt.verify(token, app.get('superSecret'), function (err, decoded) {
      if (err) {
        return res.status(403).json({
          success: false,
          message: '无效的token.'
        });
      } else {
        // 如果验证通过，在req中写入解密结果
        req.decoded = decoded;
        //console.log(decoded)  ;
        next(); //继续下一步路由
      }
    });
  } else {
    // 没有拿到token 返回错误 
    return res.status(401).send({
      success: false,
      message: '没有找到token.'
    });

  }
});


app.use('/', indexRouter);
app.use('/users', usersRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;