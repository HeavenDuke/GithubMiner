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
var neo4j = require('node-neo4j');
var mongoose = require('mongoose');
var Github = require('github');
var schedule = require('node-schedule');
var routers = require('../routers');
var GithubMaster = require('../libs').crawlers;

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
    var config = require('../../config')(this.environment);
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

Server.prototype.initialize_global_variables = function (config) {
    require('../libs').date();
    global.config = config;
    global.db = new neo4j(config.database.queryString);
    global.mongoose = {
        db0: require('../database').loader1,
        db1: require('../database').loader2,
        flag: require('../database').flagdatabase
    };
    global.language_style = require('../../config/laguage_colors.json');

    var github = new Github(config.github.options);
    github.authenticate({
        type: "oauth",
        key: config.github.oauth.client_id,
        secret: config.github.oauth.client_secret,
    });
    global.master = new GithubMaster([github]);
};

Server.prototype.schedule_tasks = function (config) {
    var jobs = require('../jobs');

    var j1 = schedule.scheduleJob("0 0 0 * * *", jobs.RefreshRepositoryUpdateStatusJob(config));

    var j2 = schedule.scheduleJob("0 0 0 * * *", jobs.RefreshRankingJob(config));

    var j3 = schedule.scheduleJob("0 5 0 * * *", jobs.UpdateNewRepositoryRankingJob(config));

    var j4 = schedule.scheduleJob("0 0 * * * *", jobs.FetchActionJob(config));

    var j5 = schedule.scheduleJob("0 10 0 * * *", jobs.UpdateRecommendationCacheJob(config));

};

Server.prototype.connect_database = function (config) {
    mongoose.connect(config.mongoose, {
        server: {
            poolSize: 12,
            socketOptions: {
                keepAlive: 1
            }
        }
    });
};


module.exports = Server;