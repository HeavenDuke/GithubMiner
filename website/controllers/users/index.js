/**
 * Created by heavenduke on 17-4-28.
 */

var https = require('https');
var Github = require('github');
var Profile = require('../../libs').profile;

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
                        var user = result.data;
                        global.db.cypherQuery("MERGE (u:User {user_id: " + user.id
                            + "}) SET u.login='" + user.login
                            + "', u.avatar_url='" + user.avatar_url + "'", function (err, result) {
                            req.session.user = {
                                access_token: access_token,
                                info: user
                            };
                            user.user_id = user.id;
                            Profile.construct_profile(user, github, function () {});
                            res.redirect(req.session.astepback);
                        });
                    }).catch(function (err) {
                        return next(err);
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
        var query = global.config.github.oauth.query();
        req.session.nonce_str = query.nonce_str;
        return res.redirect(query.url);
    }
};

exports.destroy = function (req, res, next) {
    delete req.session.user;
    res.redirect('/');
};