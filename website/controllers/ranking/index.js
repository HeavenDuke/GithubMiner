/**
 * Created by heavenduke on 17-4-28.
 */

var neo4j = require('node-neo4j');

exports.index = function (req, res, next) {
    var ranking = {
        daily: {
            finished: false,
            data: []
        },
        weekly: {
            finished: false,
            data: []
        },
        monthly: {
            finished: false,
            data: []
        },
        overall: {
            finished: false,
            data: []
        },
        isFinished: function () {
            return this.daily.finished && this.weekly.finished && this.monthly.finished && this.overall.finished
        }
    };
    global.db.cypherQuery("MATCH (rk:Ranking) RETURN rk.created_at AS created_at ORDER BY created_at DESC LIMIT 1", function (err, rk) {
        if (err) {
            return next(err);
        }
        else {
            global.db.cypherQuery("MATCH (rk:Ranking {created_at: " + rk.data[0] + "})-[t:Daily]-(r:Repository) RETURN r ORDER BY t.ranking DESC LIMIT 100", function (err, result) {
                if (err) {
                    return next(err);
                }
                else {
                    ranking.daily = {
                        finished: true,
                        data: result.data
                    };
                    if (ranking.isFinished()) {
                        res.render("ranking/index", {
                            ranking: ranking,
                            title: "Ranking"
                        });
                    }
                }
            });
            global.db.cypherQuery("MATCH (rk:Ranking {created_at: " + rk.data[0] + "})-[t:Weekly]-(r:Repository) RETURN r ORDER BY t.rank DESC LIMIT 100", function (err, result) {
                if (err) {
                    return next(err);
                }
                else {
                    ranking.weekly = {
                        finished: true,
                        data: result.data
                    };
                    if (ranking.isFinished()) {
                        res.render("ranking/index", {
                            ranking: ranking,
                            title: "Ranking"
                        });
                    }
                }
            });
            global.db.cypherQuery("MATCH (rk:Ranking {created_at: " + rk.data[0] + "})-[t:Monthly]-(r:Repository) RETURN r ORDER BY t.rank DESC LIMIT 100", function (err, result) {
                if (err) {
                    return next(err);
                }
                else {
                    ranking.monthly = {
                        finished: true,
                        data: result.data
                    };
                    if (ranking.isFinished()) {
                        res.render("ranking/index", {
                            ranking: ranking,
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
                    ranking.overall = {
                        finished: true,
                        data: result.data
                    };
                    if (ranking.isFinished()) {
                        res.render("ranking/index", {
                            ranking: ranking,
                            title: "Ranking"
                        });
                    }
                }
            });
        }
    });
};