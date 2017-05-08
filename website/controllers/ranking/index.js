/**
 * Created by heavenduke on 17-4-28.
 */

var neo4j = require('node-neo4j');

exports.index = function (req, res, next) {
    var ranking = {
        daily: [],
        weekly: [],
        monthly: [],
        overall: [],
        isFinished: function () {
            return this.daily.length * this.weekly.length * this.monthly.length * this.overall.length != 0
        }
    };
    global.db.cypherQuery("MATCH (rk:Ranking {type: 'Daily'})-[t]-(r:Repository) RETURN r ORDER BY t.rank DESC LIMIT 100", function (err, result) {
        if (err) {
            return next(err);
        }
        else {
            ranking.daily = result.data;
            if (ranking.isFinished()) {
                res.render("ranking/index", {
                    ranking: result,
                    title: "Ranking"
                });
            }
        }
    });
    global.db.cypherQuery("MATCH (rk:Ranking {type: 'Weekly'})-[t]-(r:Repository) RETURN r ORDER BY t.rank DESC LIMIT 100", function (err, result) {
        if (err) {
            return next(err);
        }
        else {
            ranking.weekly = result.data;
            if (ranking.isFinished()) {
                res.render("ranking/index", {
                    ranking: result,
                    title: "Ranking"
                });
            }
        }
    });
    global.db.cypherQuery("MATCH (rk:Ranking {type: 'Monthly'})-[t]-(r:Repository) RETURN r ORDER BY t.rank DESC LIMIT 100", function (err, result) {
        if (err) {
            return next(err);
        }
        else {
            ranking.monthly = result.data;
            if (ranking.isFinished()) {
                res.render("ranking/index", {
                    ranking: result,
                    title: "Ranking"
                });
            }
        }
    });
    global.db.cypherQuery("MATCH (r:Repository) RETURN r ORDER BY r.stargazers_count DESC LIMIT 100", function (err, result) {
        if (err) {
            return next(err);
        }
        else {
            console.log(result.data);
            // ranking.overall = result.data;
            // if (ranking.isFinished()) {
                res.render("ranking/index", {
                    ranking: result.data,
                    title: "Ranking"
                });
            // }
        }
    });
    // res.render("ranking/index", {
    //     ranking: [],
    //     title: "Ranking"
    // });
};