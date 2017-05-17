/**
 * Created by heavenduke on 17-4-28.
 */

exports.home = function (req, res, next) {
    global.db.cypherQuery("MATCH (rk:Ranking) RETURN rk.created_at AS created_at ORDER BY created_at DESC LIMIT 1", function (err, rk) {
        if (err) {
            return next(err);
        }
        else {
            global.db.cypherQuery("MATCH (rk:Ranking {created_at: " + rk.data[0] + "})-[t:Daily]-(r:Repository) RETURN r ORDER BY t.ranking DESC LIMIT 10", function (err, result) {
                if (err) {
                    return next(err);
                }
                else {
                    res.render("index", {
                        info: req.flash('info'),
                        error: req.flash('error'),
                        ranking: result.data,
                        user: req.session.user,
                        title: "GithubMiner"
                    });
                }
            });
        }
    });
};

exports.users = require('./users');

exports.search = require('./search');

exports.ranking = require('./ranking');

exports.repositories = require('./repository');

exports.api = require('./api');