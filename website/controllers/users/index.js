/**
 * Created by heavenduke on 17-4-28.
 */

var https = require('https');
var Github = require('github');

exports.create = function (req, res, next) {
    if (req.query.code) {
        var request_data = global.config.github.oauth.query_token(null, req.session.nonce_str, req.query.code);
        console.log(request_data);
        var request = https.request(request_data.options, function (rs) {
            rs.on("data", function (buffer) {
                var access_token = JSON.parse(buffer.toString()).access_token;
                if (access_token) {
                    var github = new Github(global.config.github.options);
                    github.authenticate({
                        type: "oauth",
                        token: access_token
                    });
                    github.users.get({}).then(function (result) {
                        req.session.user = {
                            access_token: access_token,
                            info: result.data
                        };
                        res.redirect(req.session.astepback);
                    });
                }
                else {
                    res.json({message: "invalid access"});
                }
            });
        });
        request.write(request_data.data);
        request.end();
    }
    else {
        res.json({message: "invalid access"});
    }
};

exports.destroy = function (req, res, next) {
    delete req.session.user
};