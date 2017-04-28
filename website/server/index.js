/**
 * Created by heavenduke on 17-4-28.
 */

var express = require('express');
var body_parser = require('body-parser');
var flash = require('connect-flash');
var session = require('express-session');
var methodOverride = require('method-override');
var RedisStore = require('connect-redis')(session);
var morgan = require('morgan');
var fs = require('fs');
var path = require('path');
var routers = require('../routers');

var Server = function (config) {
    var app = express();
    app.use(body_parser.json());
    app.use(body_parser.urlencoded({extended: false}));
    if (!fs.existsSync(config.logPath)) {
        fs.mkdirSync(config.logPath);
    }
    var accessLogStream = fs.createWriteStream(path.join(config.logPath, 'access.log'), {flags: 'a'});
    app.use(morgan(function (tokens, req, res) {
        return [
            req.headers.cookie,
            tokens.method(req, res),
            tokens.url(req, res),
            tokens.status(req, res),
            tokens.res(req, res, 'content-length'), '-',
            tokens['response-time'](req, res), 'ms'
        ].join(' ')
    }, {stream: accessLogStream}));

    app.use(session({
        store: new RedisStore(config.redis.options),
        secret: config.redis.secret,
        resave: false,
        saveUninitialized: true
    }));

    app.use(flash());

    app.use(express.static("public", config.static));
    app.set('view engine', 'pug');
    app.use(methodOverride('_method'));
    app.use('/', routers);
    this.app = app;
};

Server.prototype.listen = function (port) {
    var config = require('../config')(this.environment);
    if (this.app) {
        var server = this.app.listen(port, function () {
            var host = server.address().address;
            var port = server.address().port;

            console.log('Second_Grade Server listening at http://%s:%s', host, port);
        });
    }
    else {
        throw Error('Server not initialized!');
    }

};

Server.prototype.initialize_global_variables = function () {
    require('../libs').date();
};

Server.prototype.start_tasks = function () {

};


module.exports = Server;