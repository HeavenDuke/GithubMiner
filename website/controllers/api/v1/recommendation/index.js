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
    switch(req.query.type) {
        case "action":
            engines.from_explore_action(req.session.action, offset, pagination, function (err, result) {
                if (!err) {
                    list = list.concat(result);
                }
                console.log(err);
                if (err || list.length >= pagination) {
                    return res.json({
                        message: 'success',
                        recommendations: list
                    });
                }
                else {
                    engines.from_explore_languages(req.session.languages, 0, pagination - list.length, function (err, result) {
                        if (!err) {
                            list = list.concat(result);
                        }
                        console.log(err);
                        if (err || list.length >= pagination) {
                            return res.json({
                                message: 'success',
                                recommendations: list,
                                type: "language",
                                offset: result instanceof Array ? result.length : 0
                            });
                        }
                        else {
                            engines.lucky_guess(offset, pagination - list.length, function (err, result) {
                                if (!err) {
                                    list = list.concat(result);
                                }
                                console.log(err);
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
            engines.from_explore_languages(req.session.languages, offset, pagination, function (err, result) {
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
                    engines.lucky_guess(0, pagination - list.length, function (err, result) {
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
            engines.lucky_guess(offset, pagination, function (err, result) {
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
            engines.collaborative_filtering(req.session.user.info, offset, limit, function (err, result) {
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
                    engines.from_explore_action(req.session.action, 0, pagination - list.length, function (err, result) {
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
                            engines.from_explore_languages(req.session.languages, 0, pagination - list.length, function (err, result) {
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
                                    engines.lucky_guess(offset, pagination - list.length, function (err, result) {
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
};

exports.repository = function (req, res, next) {
    var pagination = 10, offset = (isNaN(parseInt(req.query.offset)) ? 0 : parseInt(req.query.offset));
    global.db.cypherQuery("MATCH (r:Repository {repository_id: " + req.query.repository_id + "}) RETURN r LIMIT 1", function (err, result) {
        if (err) {
            return next(err);
        }
        else {
            var repository = result.data[0];
            if (repository) {
                var list = [];
                if (req.query.type != "content") {
                    engines.similar_social_repository(repository, offset, pagination, function (err, result) {
                        if (err) {
                            return next(err);
                        }
                        else {
                            list = list.concat(result);
                            if (list.length < pagination) {
                                engines.similar_content_repository(repository, 0, pagination - result.length, function (err, result) {
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
                    engines.similar_content_repository(repository, offset, pagination, function (err, result) {
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
};