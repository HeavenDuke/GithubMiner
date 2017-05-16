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
        github: {
            oauth: {
                api: "https://github.com/login/oauth/authorize",
                token_api: "https://github.com/login/oauth/access_token",
                client_id: "ea9d2874e18bbcbca7b6",
                client_secret: "4b2cbc7732f70666817c54f0648e25070abf73aa",
                scope: "user%20public_repo",
                redirect_url: "http%3a%2f%2fminer.heavenduke.com%2fuser",
                query: function (query) {
                    function generate_nonce_str(len) {
                        var alphabet = "qwertyuiopasdfghjklzxcvbnm1234567890QWERTYUIOPASDFGHJKLZXCVBNM";
                        var result = [];
                        for(var i = 0; i < len; i++) {
                            result.push(alphabet[Math.round(Math.random() * (alphabet.length - 1))]);
                        }
                        return result.join("");
                    }
                    var noncestr = generate_nonce_str(10);
                    return {
                        url: config.github.oauth.api + "?client_id=" + config.github.oauth.client_id
                        + "&scope=" + config.github.oauth.scope
                        + "&redirect_url=" + (query ? query : config.github.oauth.redirect_url)
                        + "&state=" + noncestr
                        + "&allow_signup=true",
                        nonce_str: noncestr
                    }
                },
                query_token: function (query, noncestr, code) {
                    return {
                        url: config.github.oauth.token_api
                        + "?client_id=" + config.github.oauth.client_id
                        + "&client_secret=" + config.github.oauth.client_secret
                        + "&code=" + code
                        + "&redirect_url=" + (query ? query : config.github.oauth.redirect_url)
                        + "&state=" + noncestr,
                        nonce_str: noncestr
                    }
                }
            },
            auth: {
                type: "basic",
                username: "DoubleDeckers",
                password: "15tfosaaub_rees"
            },
            options: {
                protocol: "https",
                host: "api.github.com",
                headers: {
                    "Accept": "application/vnd.github.mercy-preview+json"
                },
                Promise: require('bluebird'),
                timeout: 5000
            }
        },
        mongoose: "mongodb://localhost:27017/githubminer",
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