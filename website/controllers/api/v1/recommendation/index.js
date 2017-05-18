/**
 * Created by heavenduke on 17-4-28.
 */
var http = require('http');
var engines = require('../../../../libs').recommendation;

exports.guess = function (req, res, next) {
    // 一共10个位置，采用：ITEM-CF > ACTION > LANGUAGE > LUCKY GUESS
    var pagination = 10;
    var offset = (isNaN(parseInt(req.query.offset)) ? 0 : parseInt(req.query.offset));
    var list = [];
    if (!req.session.action) {
        req.session.action = {};
    }
    if (!req.session.languages) {
        req.session.languages = {};
    }
    if (!req.query.type && !req.session.user) {
        req.query.type = "action";
    }
    if (req.session.user) {
        global.db.cypherQuery("MATCH (u:User {user_id: " + req.session.user.info.user_id + "})-[:Star]->(r:Repository) RETURN r.repository_id", function (err, result) {
            if (err) {
                console.log(err);
                return res.json({
                    message: "success",
                    recommendations: []
                });
            }
            else {
                temp(result.data);
            }
        });
    }
    else {
        temp();
    }

    function temp(excluded) {
        excluded = excluded instanceof Array ? excluded : [];
        switch (req.query.type) {
            case "action":
                engines.from_explore_action(req.session.action, excluded, offset, pagination, function (err, result) {
                    if (!err) {
                        list = list.concat(result);
                    }
                    if (err || list.length >= pagination) {
                        return res.json({
                            message: 'success',
                            recommendations: list
                        });
                    }
                    else {
                        engines.from_explore_languages(req.session.languages, excluded, 0, pagination - list.length, function (err, result) {
                            if (!err) {
                                list = list.concat(result);
                            }
                            if (err || list.length >= pagination) {
                                return res.json({
                                    message: 'success',
                                    recommendations: list,
                                    type: "language",
                                    offset: result instanceof Array ? result.length : 0
                                });
                            }
                            else {
                                engines.lucky_guess(excluded, offset, pagination - list.length, function (err, result) {
                                    if (!err) {
                                        list = list.concat(result);
                                    }
                                    return res.json({
                                        message: 'success',
                                        recommendations: list,
                                        type: 'lucky',
                                        offset: result instanceof Array ? result.length : 0
                                    });
                                });
                            }
                        });
                    }
                });
                break;
            case "language":
                engines.from_explore_languages(req.session.languages, excluded, offset, pagination, function (err, result) {
                    if (!err) {
                        list = list.concat(result);
                    }
                    if (err || list.length >= pagination) {
                        return res.json({
                            message: 'success',
                            recommendations: list
                        });
                    }
                    else {
                        engines.lucky_guess(excluded, 0, pagination - list.length, function (err, result) {
                            if (!err) {
                                list = list.concat(result);
                            }
                            return res.json({
                                message: 'success',
                                recommendations: list,
                                type: 'lucky',
                                offset: result instanceof Array ? result.length : 0
                            });
                        });
                    }
                });
                break;
            case "lucky":
                engines.lucky_guess(excluded, offset, pagination, function (err, result) {
                    if (!err) {
                        list = list.concat(result);
                    }
                    return res.json({
                        message: 'success',
                        recommendations: list
                    });
                });
                break;
            default:
                engines.collaborative_filtering(req.session.user.info, excluded, offset, pagination, function (err, result) {
                    if (!err) {
                        list = list.concat(result);
                    }
                    if (err || list.length >= pagination) {
                        return res.json({
                            message: 'success',
                            recommendations: list
                        });
                    }
                    else {
                        engines.from_explore_action(req.session.action, excluded, 0, pagination - list.length, function (err, result) {
                            if (!err) {
                                list = list.concat(result);
                            }
                            if (err || list.length >= pagination) {
                                return res.json({
                                    message: 'success',
                                    recommendations: list,
                                    type: 'action',
                                    offset: result instanceof Array ? result.length : 0
                                });
                            }
                            else {
                                engines.from_explore_languages(req.session.languages, excluded, 0, pagination - list.length, function (err, result) {
                                    if (!err) {
                                        list = list.concat(result);
                                    }
                                    if (err || list.length >= pagination) {
                                        return res.json({
                                            message: 'success',
                                            recommendations: list,
                                            type: "language",
                                            offset: result instanceof Array ? result.length : 0
                                        });
                                    }
                                    else {
                                        engines.lucky_guess(excluded, offset, pagination - list.length, function (err, result) {
                                            if (!err) {
                                                list = list.concat(result);
                                            }
                                            return res.json({
                                                message: 'success',
                                                recommendations: list,
                                                type: 'lucky',
                                                offset: result instanceof Array ? result.length : 0
                                            });
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
                break;
        }
    }
};

exports.repository = function (req, res, next) {
    var pagination = 10, offset = (isNaN(parseInt(req.query.offset)) ? 0 : parseInt(req.query.offset));
    if (req.session.user) {
        global.db.cypherQuery("MATCH (u:User {user_id: " + req.session.user.info.user_id + "})-[:Star]->(r:Repository) RETURN r.repository_id", function (err, result) {
            if (err) {
                console.log(err);
                return res.json({
                    message: "success",
                    recommendations: []
                });
            }
            else {
                temp(result.data);
            }
        });
    }
    else {
        temp();
    }

    function temp(excluded) {
        excluded = excluded instanceof Array ? excluded : [];
        global.db.cypherQuery("MATCH (r:Repository {repository_id: " + req.query.repository_id + "}) RETURN r LIMIT 1", function (err, result) {
            if (err) {
                return next(err);
            }
            else {
                var repository = result.data[0];
                if (repository) {
                    var list = [];
                    if (req.query.type != "content") {
                        engines.similar_social_repository(repository, excluded, offset, pagination, function (err, result) {
                            if (err) {
                                return next(err);
                            }
                            else {
                                list = list.concat(result);
                                if (list.length < pagination) {
                                    engines.similar_content_repository(repository, excluded, 0, pagination - result.length, function (err, result) {
                                        if (err) {
                                            res.json({
                                                message: "success",
                                                recommendations: list,
                                                type: "content"
                                            });
                                        }
                                        else {
                                            list = list.concat(result);
                                            res.json({
                                                message: "success",
                                                recommendations: list,
                                                type: "content",
                                                offset: result.length
                                            });
                                        }
                                    });
                                }
                                else {
                                    res.json({
                                        message: "success",
                                        recommendations: result
                                    });
                                }
                            }
                        });
                    }
                    else {
                        engines.similar_content_repository(repository, excluded, offset, pagination, function (err, result) {
                            if (err) {
                                res.json({
                                    message: "success",
                                    recommendations: []
                                });
                            }
                            else {
                                list = list.concat(result);
                                res.json({
                                    message: "success",
                                    recommendations: list,
                                    type: "content"
                                });
                            }
                        });
                    }
                }
                else {
                    res.json({
                        message: "success",
                        recommendations: []
                    });
                }
            }
        });
    }
};