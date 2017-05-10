/**
 * Created by heavenduke on 17-4-28.
 */

var neo4j = require('node-neo4j');

exports.index = function (req, res, next) {
<<<<<<< HEAD
    var ranking = {
        daily: [],
        weekly: [],
        monthly: [],
        overall: [],
        isFinished: function () {
            return this.daily.length * this.weekly.length * this.monthly.length * this.overall.length != 0
        }
    };
    // global.db.cypherQuery("MATCH (rk:Ranking {type: 'Daily'})-[t]-(r:Repository) RETURN r ORDER BY t.rank DESC LIMIT 100", function (err, result) {
    //     if (err) {
    //         return next(err);
    //     }
    //     else {
    //         ranking.daily = result.data;
    //         if (ranking.isFinished()) {
    //             // res.render("ranking/index", {
    //             //     ranking: result,
    //             //     title: "Ranking"
    //             // });
    //         }
    //     }
    // });
    // global.db.cypherQuery("MATCH (rk:Ranking {type: 'Weekly'})-[t]-(r:Repository) RETURN r ORDER BY t.rank DESC LIMIT 100", function (err, result) {
    //     if (err) {
    //         return next(err);
    //     }
    //     else {
    //         ranking.weekly = result.data;
    //         if (ranking.isFinished()) {
    //             res.render("ranking/index", {
    //                 ranking: result,
    //                 title: "Ranking"
    //             });
    //         }
    //     }
    // });
    // global.db.cypherQuery("MATCH (rk:Ranking {type: 'Monthly'})-[t]-(r:Repository) RETURN r ORDER BY t.rank DESC LIMIT 100", function (err, result) {
    //     if (err) {
    //         return next(err);
    //     }
    //     else {
    //         ranking.monthly = result.data;
    //         if (ranking.isFinished()) {
    //             res.render("ranking/index", {
    //                 ranking: result,
    //                 title: "Ranking"
    //             });
    //         }
    //     }
    // });
    // global.db.cypherQuery("MATCH (r:Repository) RETURN r ORDER BY r.stargazers_count DESC LIMIT 100", function (err, result) {
    //     if (err) {
    //         return next(err);
    //     }
    //     else {
    //         console.log(result.data);
    //         // ranking.overall = result.data;
    //         // if (ranking.isFinished()) {
    //             res.render("ranking/index", {
    //                 ranking: result.data,
    //                 title: "Ranking"
    //             });
    //         // }
    //     }
    // });
    res.render("ranking/index", {
        ranking: [{repository_id:'10',name:'Cao',stargazers_count:11,description:'Emualte Browser from Some Browsers'},
        {repository_id:'11',name:'Ao',stargazers_count:12,description:'Emualte Browser from Some Browsers'}
        ],
        title: "Ranking"
=======
    var types = ["Daily", "Weekly", "Monthly"];
    var type = types.includes(req.query.type) ? req.quer.type : "";
    global.db.cypherQuery("MATCH (rk:Ranking) RETURN rk.created_at AS created_at ORDER BY created_at DESC LIMIT 1", function (err, rk) {
        if (err) {
            return next(err);
        }
        else {
            if (type != "") {
                global.db.cypherQuery("MATCH (rk:Ranking {created_at: " + rk.data[0] + "})-[t:" + type + "]-(r:Repository) RETURN r ORDER BY t.ranking DESC LIMIT 100", function (err, result) {
                    if (err) {
                        return next(err);
                    }
                    else {
                        res.render("ranking/index", {
                            info: req.flash('info'),
                            error: req.flash('error'),
                            ranking: result.data,
                            title: "Ranking"
                        });
                    }
                });
            }
            else {
                global.db.cypherQuery("MATCH (r:Repository) RETURN r ORDER BY r.stargazers_count DESC LIMIT 100", function (err, result) {
                    if (err) {
                        return next(err);
                    }
                    else {
                        res.render("ranking/index", {
                            info: req.flash('info'),
                            error: req.flash('error'),
                            ranking: result.data,
                            title: "Ranking"
                        });
                    }
                });
            }
        }
>>>>>>> 3426cec2c9f86c68fdf703c8c28fa5ec16075222
    });
};