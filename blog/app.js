//引入express模块
var express = require('express');
//引入path模块join __dirname resolve
var path = require('path');
//
var favicon = require('serve-favicon');
//打印日志的模块
var logger = require('morgan');
//cookie  req.cookies res.cookie
var cookieParser = require('cookie-parser');
//post请求,  表单提交的时候, req.body
var bodyParser = require('body-parser');
//引入session模块
var session = require('express-session');
//将session信息保存到数据库中
var MongoStore = require('connect-mongo')(session);

//引入路由容器
var index = require('./routes/index');
var user = require('./routes/user');
var article = require('./routes/article');


//创建app, 其实一个函数，http.createServer
var app = express();

// view engine setup
//设置模版引擎文件跟路径
app.set('views', path.join(__dirname, 'views'));
//设置模版引擎文件类型
app.set('view engine', 'html');
//设置html文件用ejs语法渲染
app.engine('html', require('ejs').__express);

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));

// 用来请求请求体是json对象    {age: 18, name:chenchao}
app.use(bodyParser.json());
// 用来处理post表单提交   age=18&name=chenchao
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
//设置静态资源文件根路径
app.use(express.static(path.join(__dirname, 'public')));
//使用session模块
app.use(session({
    secret: 'come',
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({
        //数据库的连接地址
        url: require('./dbUrl').dbUrl
    })
}));


//公共中间件，用来处理所有路由中的公共操作
app.use(function (req, res, next) {
    //向所有的模版引擎文件都增加user属性
    res.locals.user = req.session.user;//获取session中用户登陆的信息

    next();
});


//中间件
//所有/开头的路由交给index路由容器处理
app.use('/', index);
//所有/user开头的路由交给user路由容器处理
app.use('/user', user);
//所有/article开头的路由交给article路由容器处理
app.use('/article', article);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {   //错误处理中间件
    // set locals, only providing error in development
    //给模版引擎文件传递数据第二种方式
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
