/**
 * Created by heavenduke on 17-4-28.
 */

var path = require('path');

module.exports = function (environment) {

    var config = {
        server: {
            port: 3002
        },
        database: {
            host: "localhost",
            username: "github",
            password: "github",
            port: 7474,
            queryString: function () {
                return "http://" + config.database.username + ":"
                                 + config.database.password + "@"
                                 + config.database.host + ":"
                                 + config.database.port;
            }
        },
        redis: {
            options: {
                host: '127.0.0.1',
                port: 6379
            },
            queue: "queue:second_grade",
            secret: '654321_SeCoNd-GrAdE^123456'
        },
        static: {
            dotFiles: 'ignore',
            etag: false,
            extensions: ['js', 'css', 'jpg', 'jpeg', 'png', 'gif', 'bmp'],
            index: false,
            maxAge: '1d',
            redirect: false,
            setHeaders: function (res, path, stat) {
                res.set('x-timestamp', Date.now())
            }
        },
        logPath: path.join(__dirname, "../", "log")
    };

    if (environment == "development" || environment == "local") {

    }
    config.database.queryString = config.database.queryString();
    return config;

};