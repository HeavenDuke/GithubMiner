/**
 * Created by heavenduke on 17-4-28.
 */

var engines = require('../../../../libs').recommendation;

exports.guess = function (req, res, next) {
    var pagination = 6, restart = !!req.query.restart, excludes;
    if (restart) {
        excludes = [];
        req.session.guess_excludes = excludes;
    }
    else {
        excludes = req.session.guess_excludes;
        if (!excludes) {
            excludes = [];
        }
    }
    global.db.cypherQuery("MATCH (r:Repository) WHERE NOT(r.repository_id IN " + JSON.stringify(excludes) + ") RETURN r.repository_id as repository_id, r.full_name as full_name, r.description as description, r.stargazers_count as stargazers_count, rand() as score ORDER BY score DESC LIMIT " + pagination + "", function (err, result) {
        if (err) {
            return next(err);
        }
        else {
            for(var i = 0; i < result.data.length; i++) {
                excludes.push(result.data[i][0]);
                result.data[i] = {
                    repository_id: result.data[i][0],
                    full_name: result.data[i][1],
                    description: result.data[i][2],
                    stargazers_count: result.data[i][3]
                }
            }
            req.session.guess_excludes = excludes;
            res.json({
                message: "success",
                recommendations: result.data
            });
        }
    });
};

exports.repository = function (req, res, next) {
    var pagination = 6;
    global.db.cypherQuery("MATCH (r:Repository {repository_id: " + req.query.repository_id + "}) RETURN r LIMIT 1", function (err, result) {
        if (err) {
            return next(err);
        }
        else {
            var repository = result.data[0];
            if (repository) {
                engines.social(repository, (isNaN(parseInt(req.query.offset)) ? 0 : parseInt(req.query.offset)) , pagination, function (err, result) {
                    if (err) {
                        return next(err);
                    }
                    else {
                        res.json({
                            message: "success",
                            recommendations: result
                        });
                    }
                });
            }
            else {
                res.json({
                    message: "success",
                    recommendations: []
                });
            }
        }
    });
};