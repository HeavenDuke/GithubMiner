/**
 * Created by heavenduke on 17-4-28.
 */

var neo4j = require('node-neo4j');

exports.index = function (req, res, next) {
    var type = ["Daily", "Weekly", "Hourly", "Overall"].includes(req.query.type) ? req.query.type : "Daily";
    if (type == "Overall") {
        global.db.cypherQuery("MATCH (r:Repository) RETURN r ORDER BY r.stargazers_count DESC LIMIT 100", function (err, result) {
            if (err) {
                return next(err);
            }
            else {
                res.render("ranking/index", {
                    ranking: result.data,
                    type: type,
                    title: "Ranking"
                });
            }
        });
    }
    else {
        global.db.cypherQuery("MATCH (rk:Ranking) RETURN rk.created_at AS created_at ORDER BY created_at DESC LIMIT 1", function (err, rk) {
            if (err) {
                return next(err);
            }
            else {
                global.db.cypherQuery("MATCH (rk:Ranking {created_at: " + rk.data[0] + "})-[t:" + type + "]-(r:Repository) RETURN r ORDER BY t.ranking DESC LIMIT 100", function (err, result) {
                    if (err) {
                        return next(err);
                    }
                    else {
                        res.render("ranking/index", {
                            ranking: result.data,
                            type: type,
                            title: "Ranking"
                        });
                    }
                });
            }
        });
    }
};